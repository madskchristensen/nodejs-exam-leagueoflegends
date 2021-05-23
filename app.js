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
// contentSecurityPolicy needs to be configured, otherwise scripts, styles etc. wont be allowed from cdns
const helmet = require ("helmet");
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "script-src": ["'self'", "*.fontawesome.com", "*.jquery.com", "*.jsdelivr.net"],
            "connect-src": ["'self'", "ka-f.fontawesome.com"],
            "style-src": ["'self'", "*.fontawesome.com", "*.jsdelivr.net", "'unsafe-inline'"], // unsafe-inline needed to allow fontawesome icons
            "font-src": ["'self'", "*.fontawesome.com"]
        }
    }));

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

// components
const header = fs.readFileSync(__dirname + "/public/header/header.html", "utf-8");

// pages
const frontpage = fs.readFileSync(__dirname + "/public/frontpage/frontpage.html", "utf-8");
const login = fs.readFileSync(__dirname + "/public/login/login.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html", "utf-8");

// mongodb util module.
// Can be called with .query() to perform operations like insert, find etc.
const db = require("./mongodb/db");

// paths for all users to access
app.get("/", (req, res) => {
    res.send(header + frontpage + footer);
})

app.get("/login", (req, res) => {
    res.send(header + login + footer);
})

// intercept all incoming requests with login check except above, as they are allowed for all users
app.get("/*", (req, res, next) => {
    // check if path is valid
    if (!paths.includes(req.path)) {
        res.status(404).send(header + "<h4>Sorry the page doesnt exist </h1>");
    }
    // check if user is authorized
    else if (!(req.session.loggedIn === true)) {
        res.status(401).send(header + "<h4>Sorry but you are not authorized to view this page </h1>")
    }
    else {
        next();
    }
})

// paths allowed for logged in users only 
app.get("/test", (req, res) => {
    res.send(header + footer);
})

// register all valid paths
const paths = [];

// loop through all defined paths and add to array
app._router.stack.forEach( (router) => {
    if (router.route && router.route.path){
      paths.push(router.route.path);
    }
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
