// dotenv setup
const dotenvResult = require("dotenv").config();

if (dotenvResult.error) {
    throw dotenvResult.error;
}

// express setup
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// allow static content to be served
app.use(express.static("public"));

// use helmet for better security
const helmet = require ("helmet");
app.use(helmet());

// socket.io setup
// wrap express in plain node.js http server
const server = require("http").createServer(app);

// atttach socket.io to http server
const io = require("socket.io")(server);

// escapehtml setup
const escapeHTML = require("html-escaper").escape;

// mongodb util module.
// Can be called with .query() to perform operations like insert, find etc.
const db = require("./mongodb/db");

app.get("/", (req, res) => {
    res.send("index");
})

// listen at specified port
db.connect(() => {
    server.listen(port, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Express listening at port", port);
        }
    })
})
