import esbuild from 'esbuild';
import svgrPlugin from 'esbuild-plugin-svgr';
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inlineAssetsPlugin from './esbuildInlineHtmlPlugin.mjs';
import reanimatedPlugin from './esbuildReanimatedPlugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDirectory = path.resolve(__dirname, '../');
const buildConfigPath = path.resolve(__dirname, 'buildConfig.json');

const isProduction = process.env.NODE_ENV === 'production';

const cssnano = await import('cssnano'); // Import cssnano as a module

function extractAliases() {
  try {
    const buildConfig = JSON.parse(fs.readFileSync(buildConfigPath, 'utf8'));

    return buildConfig.aliases;
  } catch (error) {
    console.error('Error reading build config:', error);
    return {};
  }
}

console.time('Bundling with esbuild took:');
// esbuild config
esbuild
  .build({
    entryPoints: [path.resolve(appDirectory, 'index.web.js')],
    outdir: path.resolve(appDirectory, 'dist'),
    bundle: true,
    minify: isProduction,
    sourcemap: !isProduction,
    legalComments: 'none',
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.gif': 'dataurl',
      '.ttf': 'dataurl',
      '.otf': 'dataurl',
      '.html': 'text',
      '.js': 'jsx',
    },
    define: {
      __DEV__: JSON.stringify(!isProduction),
      'process.env.JEST_WORKER_ID': 'null',
      'process.env': JSON.stringify({}),
    },
    resolveExtensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    alias: extractAliases(),
    plugins: [
      reanimatedPlugin(),
      // Plugin for handling SASS styles
      sassPlugin({
        sourceMap: !isProduction,
        postcss: {
          plugins: [cssnano.default({ preset: 'default' })],
        },
      }),

      // Plugin to handle SVG imports as React components
      svgrPlugin(),

      inlineAssetsPlugin({
        htmlTemplate: path.resolve(appDirectory, 'web/index.html'), // Path to your HTML template
        outputDir: path.resolve(appDirectory, 'dist'), // Output directory where index.html will be written
      }),
    ],
  })
  .then(() => console.timeEnd('Bundling with esbuild took:'))
  .catch(() => process.exit(1));
