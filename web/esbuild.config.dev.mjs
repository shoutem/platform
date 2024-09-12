import esbuild from 'esbuild';
import svgrPlugin from 'esbuild-plugin-svgr';
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from 'fs';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import inlineAssetsPlugin from './esbuildInlineHtmlPlugin.mjs';
import reanimatedPlugin from './esbuildReanimatedPlugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDirectory = path.resolve(__dirname, '../');
const buildConfigPath = path.resolve(__dirname, 'buildConfig.json');

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

const ctx = await esbuild.context({
  entryPoints: [path.resolve(appDirectory, 'index.web.js')],
  outdir: path.resolve(appDirectory, 'dist'),
  bundle: true,
  minify: false,
  sourcemap: true,
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
    __DEV__: JSON.stringify(true),
    'process.env.JEST_WORKER_ID': 'null',
    'process.env': JSON.stringify({}),
  },
  resolveExtensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
  alias: extractAliases(),
  plugins: [
    reanimatedPlugin(),
    // Plugin for handling SASS styles
    sassPlugin({
      sourceMap: true,
      postcss: {
        plugins: [cssnano.default({ preset: 'default' })],
      },
    }),

    // Plugin to handle SVG imports as React components
    svgrPlugin(),

    inlineAssetsPlugin({
      htmlTemplate: path.resolve(appDirectory, 'web/index.html'),
      outputDir: path.resolve(appDirectory, 'dist'),
      production: false,
    }),
  ],
});

const { host, port } = await ctx.serve({
  servedir: path.resolve(appDirectory, 'dist'),
});

// Open the URL in the default browser
await open(`http://${host}:${port}`);
