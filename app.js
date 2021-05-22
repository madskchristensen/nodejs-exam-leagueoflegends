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

// node-fetch setup
const fetch = require("node-fetch");

// session setup
// create session 
const session = require("express-session");

app.use(session({
    secret: process.env.SESSION_SECRET.split(","), // used to compute hash. split to process dotenv variable as array
    name: process.env.SESSION_NAME, // hidden custom name to avoid fingerprinting
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // dont require HTTPS connection
        sameSite: true, // block CORS req
        maxAge: 600000 // Time in miliseconds - 10 minutes
    }
}));

const sessionRouter = require("./router/session.js");
app.use(sessionRouter.router);

const fs = require('fs');
const frontpage = fs.readFileSync(__dirname + "/public/frontpage/frontpage.html", "utf-8")
const login = fs.readFileSync(__dirname + "/public/login/login.html", "utf-8")

// mongodb util module.
// Can be called with .query() to perform operations like insert, find etc.
const db = require("./mongodb/db");

app.get("/", (req, res) => {
    res.send(frontpage);
})

app.get("/login", (req, res) => {
    res.send(login);
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
