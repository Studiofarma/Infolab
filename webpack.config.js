const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/frontend/index.js"),
  },

  output: {
    path: path.resolve(__dirname, "./src/main/resources/static"),
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/frontend/index.html"),
    }),
  ],

  mode: "development",
};
