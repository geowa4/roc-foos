const webpack = require("webpack")

module.exports = function (isProduction) {
  return {
    debug: !isProduction,
    devtool: !isProduction ? 'source-map' : undefined,
    plugins: !isProduction ? [] : [
      new webpack.optimize.UglifyJsPlugin({minimize: true})
    ],
    output: {
      path: __dirname + '/dist',
      filename: 'main.js'
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
      ]
    }
  }
}
