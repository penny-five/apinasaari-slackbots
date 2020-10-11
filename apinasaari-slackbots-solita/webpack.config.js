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
