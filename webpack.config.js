const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  entry: "./js/app.js", // Entry point for your JavaScript application
  output: {
    filename: "js/bundle.js",
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.css$/, // For .css files
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/, // For .js files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], // Transpile JS to backwards compatible version
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Webpack Project",
      template: "index.html", // Template file
    }),
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "manifest.json" }, // Copies manifest.json to the dist directory
        { from: "images", to: "images" }, // Copies manifest.json to the dist directory
        { from: "cifras", to: "cifras" }, // Copies manifest.json to the dist directory
      ],
    }),
    new InjectManifest({
      swSrc: './js/service-worker.js', // Path to your source service worker file.
      swDest: 'service-worker.js', // Destination filename in the output directory.
      exclude: [ /\.map$/, /^manifest.*\.js(?:on)?$/, /\.gitignore$/, /^\.DS_Store$/ ],
    }),
  ],
  mode: "development", // Set the mode to development or production
};
