const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const fs = require('fs').promises;

const REANIMATED_IMPORT_REGEX = /['"]react-native-reanimated['"]/;
const WORKLET_DIRECTIVE_REGEX = /['"]worklet['"]/;

/**
 * Adds a dependency array to reanimated hook calls (useAnimatedStyle,
 * useDerivedValue, ...) that omit one, collecting every `foo.value` read
 * inside the callback. Returns the (possibly rewritten) source.
 *
 * @param {string} code Original file source.
 * @returns {string}
 */
function addMissingDependencyArrays(code) {
  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const reanimatedImports = new Set();

  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === 'react-native-reanimated') {
        for (const spec of path.node.specifiers) {
          if (t.isImportSpecifier(spec)) {
            reanimatedImports.add(spec.local.name);
          }
        }
      }
    },
  });

  if (reanimatedImports.size === 0) {
    return code;
  }

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      const callee = node.callee;

      if (!t.isIdentifier(callee) || !reanimatedImports.has(callee.name)) {
        return;
      }

      const callback = node.arguments[0];

      if (
        !t.isArrowFunctionExpression(callback) &&
        !t.isFunctionExpression(callback)
      ) {
        return;
      }

      const dependencies = new Set();

      // Only collect the object identifiers used like foo.value
      traverse(
        callback.body,
        {
          MemberExpression(innerPath) {
            const innerNode = innerPath.node;
            if (
              t.isIdentifier(innerNode.object) &&
              t.isIdentifier(innerNode.property) &&
              innerNode.property.name === 'value'
            ) {
              dependencies.add(innerNode.object.name);
            }
          },
        },
        path.scope,
      );

      if (node.arguments.length < 2 || !t.isArrayExpression(node.arguments[1])) {
        const depArray = t.arrayExpression(
          Array.from(dependencies).map(name => t.identifier(name)),
        );

        if (node.arguments.length === 1) {
          node.arguments.push(depArray);
        } else {
          node.arguments[1] = depArray;
        }
      }
    },
  });

  return generate(ast, {}, code).code;
}

/**
 * Runs the official Reanimated babel plugin so that `'worklet'` functions and
 * auto-workletized hook callbacks (useAnimatedStyle, useAnimatedGestureHandler,
 * Gesture.* callbacks, ...) get their `__workletHash` metadata. Reanimated 3.16+
 * throws at runtime on web when a handler is not a worklet, so this must run
 * for app code and node_modules alike. Only syntax plugins are enabled - JSX
 * and TypeScript are left intact for esbuild to strip.
 *
 * @param {string} code Source to transform.
 * @param {string} filename Absolute path, used for source maps and TSX detection.
 * @returns {Promise<string>}
 */
async function workletize(code, filename) {
  const isTypeScript = /\.tsx?$/.test(filename);

  const result = await babel.transformAsync(code, {
    filename,
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    compact: false,
    retainLines: true,
    plugins: [
      isTypeScript
        ? ['@babel/plugin-syntax-typescript', { isTSX: true }]
        : '@babel/plugin-syntax-jsx',
      'react-native-reanimated/plugin',
    ],
  });

  return result.code;
}

module.exports = function reanimatedPlugin() {
  return {
    name: 'reanimated-plugin',
    setup(build) {
      build.onLoad({ filter: /\.(js|jsx|ts|tsx)$/ }, async args => {
        const code = await fs.readFile(args.path, 'utf8');

        const importsReanimated = REANIMATED_IMPORT_REGEX.test(code);
        const hasWorklet = WORKLET_DIRECTIVE_REGEX.test(code);

        if (!importsReanimated && !hasWorklet) {
          return;
        }

        let _code = code;

        if (importsReanimated) {
          _code = addMissingDependencyArrays(_code);
        }

        _code = await workletize(_code, args.path);

        return {
          contents: _code,
          loader: 'tsx',
        };
      });
    },
  };
};
