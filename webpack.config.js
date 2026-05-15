const path = require('path');

// Multiple exports with Webpack:
// https://stackoverflow.com/questions/35903246/how-to-create-multiple-output-paths-in-webpack-config
module.exports = {
  entry: {
    './home/bundle' : './src/home/loader-home.ts',
    './about/bundle' : './src/about/loader-about.ts',
  },
  module: {
    rules: [
      {
        test: [/\.ts?$/,/\.js?$/],
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  devtool: 'source-map'
};
