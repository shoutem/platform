const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');

const appDirectory = path.resolve(__dirname, '../');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDev = nodeEnv === 'development';

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    //NativeModuleInjectionMark-webpack-config-babel-include
    path.resolve(appDirectory, 'index.js'),
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'core'),

    // Multiple extensions reference ( leaving it as general override )
    path.resolve(appDirectory, 'node_modules/react-native-image-picker'),

    filepath => /extensions\/[^/]+\/app\//.test(filepath),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // The 'metro-react-native-babel-preset' preset is recommended to match React Native's packager
      presets: ['module:@react-native/babel-preset', '@babel/preset-flow'],
      // Re-write paths to import only the modules needed by the app
      plugins: ['react-native-web',
        ["module-resolver", {
          "alias": {
            "^react-native$": "react-native-web",
            "^shoutem-core$": path.resolve(appDirectory, 'core'),
          }
        }],
        ['@babel/plugin-proposal-decorators', { legacy: true }],
      ],
    }
  }
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    }
  }
};

// SVG import support
const svgImportLoaderConfiguration = {
  test: /\.svg$/,
  use: [{ loader: '@svgr/webpack', options: { dimensions: false } }],
}

const styleRules = [
  {
    test: /\.css$/,
    use: [
      !isProduction ? 'style-loader' : MiniCssExtractPlugin.loader,
      { loader: 'css-loader' },
    ],
  },
  {
    test: /\.scss$/,
    use: [
      !isProduction ? 'style-loader' : MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          sourceMap: !isProduction,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions:{
            plugins: [require('cssnano')({ preset: 'default' })], 
          },
          sourceMap: !isProduction,
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: !isProduction,
        },
      },
    ],
  },
];

const tsLoaderConfiguration = {
  test: /\.(ts)x?$/,
  exclude: /node_modules|\.d\.ts$/, // this line as well
  use: {
    loader: 'ts-loader',
    options: {
      compilerOptions: {
        noEmit: false, // this option will solve the issue
      },
    },
  },
};

const htmlLoaderConfiguration = {
  test: /\.html$/i,
  loader: "html-loader",
};

const fontLoaderConfiguration = {
  test: /\.(ttf|otf)(\?.*)?$/,
  use: [
    {
      loader: 'url-loader',
    },
  ],
};

module.exports = {
  entry: [
    // load any web API polyfills
    // path.resolve(appDirectory, 'polyfills-web.js'),
    // your web-specific entry file
    path.resolve(appDirectory, 'index.web.js')
  ],

  // configures where the build ends up
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '',
  },

  // DEV Only
  ...(isDev ? {
    devtool: 'source-map'
  } : {}),

  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      tsLoaderConfiguration,
      htmlLoaderConfiguration,
      svgImportLoaderConfiguration,
      fontLoaderConfiguration,
      ...styleRules
    ]
  },

  resolve: {
    // This will only alias the exact import "react-native"
    alias: {
      //NativeModuleInjectionMark-webpack-config-resolve-alias

      'react-native$': 'react-native-web',
      'shoutem-core$': path.resolve(appDirectory, 'core'),

      // Solving the problem in general ( no extension ownership )
      'react-native-fast-image': 'react-native-web/dist/exports/Image',
      'react-native/Libraries/vendor/emitter/EventEmitter': 'react-native-web/dist/vendor/react-native/EventEmitter/RCTDeviceEventEmitter.js',
    },
    // If you're working on a multi-platform React Native app, web-specific
    // module implementations should be written in files using the extension
    // `.web.js`.
    extensions: [".web.tsx", ".web.ts", ".tsx", ".ts", '.web.js', '.js']
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "index.html"),
      inject: "body"
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(isDev),
    }),

    // Reanimated
    new webpack.EnvironmentPlugin({ JEST_WORKER_ID: null }),
    new webpack.DefinePlugin({ process: { env: {} } }),

    // DEV Only
    ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),

    // PROD Only
    ...(isProduction ? [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new HtmlInlineScriptPlugin()
    ] : []),
  ]
}
