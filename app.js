// dotenv setup
const dotenvResult = require("dotenv").config();

if (dotenvResult.error) {
    throw dotenvResult.error
}

// express init
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// allow static content to be served
app.use(express.static("public"));

// use helmet for better security
const helmet = require ("helmet");

// express configuration
app.use(helmet());

// socket.io setup
const server = require("http").createServer(app)
const io = require("socket.io")(server)

// escapehtml setup
const escapeHTML = require("html-escaper").escape

app.get("/", (req, res) => {
    res.send("index");
})

// listen at specified port
server.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Express listening at port", port);
    }
})
