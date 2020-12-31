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
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.ts']
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
