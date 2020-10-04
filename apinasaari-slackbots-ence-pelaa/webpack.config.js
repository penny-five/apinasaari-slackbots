const nodeExternals = require('webpack-node-externals');

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  entry: './src/index.ts',
  mode: 'production',
  target: 'node',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  externals: [nodeExternals()]
};

module.exports = config;
