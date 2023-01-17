const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./index.js"),
  },

  output: {
    path: path.resolve(__dirname, "../main/resources/static"),
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./index.html"),
    }),
    new CopyWebpackPlugin({
      patterns: [
          { from: 'js', to: 'js'},
          { from: 'css', to: 'css'}
      ]
  })
  ],

  mode: "development",
};
