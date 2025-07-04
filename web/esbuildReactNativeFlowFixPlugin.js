const generate = require('@babel/generator').default;
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const fs = require('fs').promises;

// Strip the Flow types using babel. This is done internally in metro
// on react native, and esBuild doesn't support it natively. Currently
// only focuses on certain libraries. You can add more to flowFiles if necessary
module.exports = function reactNativeFlowFixPlugin() {
  return {
    name: 'react-native-flow-fix',
    setup(build) {
      const flowFiles = [
        'node_modules/@react-native/assets-registry/registry.js',
        'node_modules/react-native/Libraries/Image/resolveAssetSource.js',
        // Add more Flow-heavy files here as needed
      ];

      build.onLoad({ filter: /\.js$/ }, async (args) => {
        if (!flowFiles.some((file) => args.path.endsWith(file))) {
          return;
        }

        const code = await fs.readFile(args.path, 'utf8');

        const ast = babelParser.parse(code, {
          sourceType: 'module',
          plugins: ['flow', 'jsx'],
        });

        traverse(ast, {
          TypeAlias(path) {
            path.remove();
          },
          Flow(path) {
            path.remove();
          },
          ImportDeclaration(path) {
            if (path.node.importKind === 'type' || path.node.importKind === 'typeof') {
              path.remove();
            }
          },
          ExportNamedDeclaration(path) {
            if (path.node.exportKind === 'type') {
              path.remove();
            }
          },
        });

        const output = generate(ast, {}, code);

        return {
          contents: output.code,
          loader: 'js',
        };
      });
    },
  };
};
