const generate = require('@babel/generator').default;
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const fs = require('fs').promises;

module.exports = function reanimatedPlugin() {
  return {
    name: 'reanimated-plugin',
    setup(build) {
      build.onLoad({ filter: /\.(js|jsx|ts|tsx)$/ }, async args => {
        const code = await fs.readFile(args.path, 'utf8');

        if (!/['"]react-native-reanimated['"]/.test(code)) {
          return;
        }

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
          return;
        }

        traverse(ast, {
          CallExpression(path) {
            const { node } = path;
            const callee = node.callee;

            if (
              t.isIdentifier(callee) &&
              reanimatedImports.has(callee.name)
            ) {
              const callback = node.arguments[0];

              if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
                const dependencies = new Set();

                // Only collect the object identifiers used like foo.value
                traverse(callback.body, {
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
                }, path.scope);

                if (
                  node.arguments.length < 2 ||
                  !t.isArrayExpression(node.arguments[1])
                ) {
                  const depArray = t.arrayExpression(
                    Array.from(dependencies).map(name => t.identifier(name))
                  );

                  if (node.arguments.length === 1) {
                    node.arguments.push(depArray);
                  } else {
                    node.arguments[1] = depArray;
                  }
                }
              }
            }
          },
        });

        const output = generate(ast, {}, code);

        return {
          contents: output.code,
          loader: 'tsx',
        };
      });
    },
  };
};
