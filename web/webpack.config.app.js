const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const SRC_DIRECTORY = path.resolve(__dirname, '../src');
const DIST_DIRECTORY = path.join(__dirname, '../icbc');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: {
    app: [
        path.join(__dirname, './index.js')
    ]
    // ReactNative: SRC_DIRECTORY
},
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      }
    }
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true }
        }
      },
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        use: {
          loader: 'url-loader',
          options: { name: '[name].[ext]' }
        }
      }
    ]
  },
  output: {
    filename: '[name].js',
    library: 'ReactNative',
    libraryTarget: 'umd',
    path: DIST_DIRECTORY,
    chunkFilename: '[name].chunk.js',
    publicPath: '/icbc'
  },
  plugins: [
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   openAnalyzer: false
    // }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProgressPlugin({ profile: false }),
      new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') })
  ],
    devServer: {
        host: '0.0.0.0',
        port: '3000',
        inline: true,
        hot: true,
        compress: true,
        clientLogLevel: 'warning'
    }
};
