const path = require("path");

module.exports = {
  devServer: {
    host: "0.0.0.0",
    disableHostCheck: true,
    before: (app) => {
      app.use("/api", require("./server/api.js"))
    }
  },
  pages: {
    index: {
      entry: "src/main.ts",
      title: "App",
    },
  },
  lintOnSave: false,
  outputDir: path.resolve(__dirname, "appdist")
};