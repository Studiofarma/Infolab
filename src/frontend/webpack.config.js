const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, "./index.js"),
  },

  output: {
    path: path.resolve(__dirname, "../main/resources/static"),
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpeg|png|jpg|svg)/,
        type: "asset/resource",
      },

      {
        test: /\.ttf$/,
        type: "asset/resource",
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./index.html"),
    }),
    // This should be assignable from cli when running the program with $env:PROFILE="something" on a line different from the one that starts the program
    new webpack.EnvironmentPlugin({
      PROFILE: "dev",
    }),
  ],

  mode: "development",
};
