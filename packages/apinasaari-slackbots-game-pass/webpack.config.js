const path = require('path');

const nodeExternals = require('webpack-node-externals');

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  entry: './src/index.ts',
  mode: process.env.NODE_ENV,
  watchOptions: {
    ignored: /node_modules/
  },
  target: 'node',
  node: {
    __dirname: true
  },
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          allowTsInNodeModules: true
        }
      }
    ]
  },
  externals: [
    nodeExternals({
      allowlist: /^@apinasaari-slackbots\/.*$/,
      modulesFromFile: true
    })
  ]
};

module.exports = config;
