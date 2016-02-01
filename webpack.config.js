var path = require("path");
var webpack = require("webpack");

module.exports = {
  target: "web",
  entry: {
    "settings": "settings-entry",
    "background": "background-entry",
  },
  output: {
    path: path.join(__dirname, "scripts"),
    filename: "[name].js",
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel",
        exclude: /node_modules/,
        query: {
          presets: ['es2015'],
        }
      },
      {
        test: /\.coffee$/,
        loader: "coffee",
      },
    ],
  },
  resolve: {
    modulesDirectories: ["node_modules"],
    root: [
      path.resolve("./src")
    ],
    extensions: ['', '.js', '.coffee'],
    alias: {
      xmlhttprequest: path.join(__dirname, '/src/xmlhttprequest-filler.js'),
    },
  },
  resolveLoader: {
    root: path.join(__dirname, "/node_modules"),
    alias: {},
  },
  plugins: [
    new webpack.ProvidePlugin({h: "virtual-dom/h"})
  ],
}
