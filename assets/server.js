const express = require("express");
const { resolve } = require("path");

const { PORT = 3000 } = process.env;
const publicPath = resolve(__dirname, "../appdist");
const staticConf = { maxAge: "1y", etag: false };

const app = express();

app.use("/api", require("./api.js"));

app.use(express.static(publicPath, staticConf));

app.listen(PORT, () => console.log(`App running on port ${PORT}!`));