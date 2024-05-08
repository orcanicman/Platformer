const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  entry: "./src/main.ts",
  plugins: [
    new ESLintPlugin({
      context: "../",
      failOnError: false,
      extensions: ["ts"],
      configType: "flat",
      eslintPath: "eslint/use-at-your-own-risk",
    }),
  ],
  mode: "production",
  stats: {
    errorDetails: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  watch: true,
};
