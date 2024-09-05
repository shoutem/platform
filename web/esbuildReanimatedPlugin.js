const generate = require('@babel/generator').default;
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs').promises;

module.exports = function reanimatedPlugin() {
  return {
    name: 'reanimated-plugin',
    setup(build) {
      build.onLoad({ filter: /\.(js|jsx|ts|tsx)$/ }, async args => {
        const code = await fs.readFile(args.path, 'utf8');

        // Skip files that don't have 'react-native-reanimated' in path or in code
        if (
          !args.path.includes('react-native-reanimated') &&
          !/import\s.*react-native-reanimated/.test(code)
        ) {
          return;
        }

        const ast = babelParser.parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        });

        traverse(ast, {
          CallExpression(path) {
            const { node } = path;
            const { callee } = node;

            if (
              callee.type === 'Identifier' &&
              [
                'useDerivedValue',
                'useAnimatedStyle',
                'useAnimatedProps',
                'useAnimatedReaction',
              ].includes(callee.name)
            ) {
              const callback = node.arguments[0];

              if (callback && callback.type === 'ArrowFunctionExpression') {
                const dependencies = new Set();

                traverse(
                  callback,
                  {
                    MemberExpression(innerPath) {
                      const { node: innerNode } = innerPath;
                      if (
                        innerNode.object &&
                        innerNode.object.type === 'Identifier' &&
                        innerNode.property &&
                        innerNode.property.name === 'value'
                      ) {
                        dependencies.add(innerNode.object.name);
                      }
                    },
                  },
                  path.scope,
                  path.parentPath,
                );

                if (
                  node.arguments.length < 2 ||
                  node.arguments[1].type !== 'ArrayExpression'
                ) {
                  node.arguments.push({
                    type: 'ArrayExpression',
                    elements: Array.from(dependencies).map(dep => ({
                      type: 'Identifier',
                      name: dep,
                    })),
                  });
                }
              }
            }
          },
        });

        // Generate the modified code
        const output = generate(ast, {}, code);

        return {
          contents: output.code,
          loader: 'tsx',
        };
      });
    },
  };
};
