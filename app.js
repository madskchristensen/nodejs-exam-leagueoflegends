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
            "script-src": ["'self'", "*.fontawesome.com", "*.jquery.com", "*.jsdelivr.net", "*.cloudflare.com", "'unsafe-inline'"],
            "connect-src": ["'self'", "ka-f.fontawesome.com"],
            "style-src": ["'self'", "*.fontawesome.com", "*.jsdelivr.net", "'unsafe-inline'"], // unsafe-inline needed to allow fontawesome icons
            "font-src": ["'self'", "*.fontawesome.com"],
            "script-src-attr": ["'self'", "'unsafe-inline'"]
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

// middleware that sets needed variables in the session
const sessionInitializer = function (req, res, next) {
    if(!req.session.loggedIn) {
        req.session.loggedIn = false;
    }

    next();
}

app.use(session({
    secret: process.env.SESSION_SECRET.split(","), // used to compute hash. split to process dotenv variable as array
    name: process.env.SESSION_NAME, // hidden custom name to avoid fingerprinting
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // dont require HTTPS connection
        httpOnly: false, // cookie inaccessible to the JavaScript Document.cookie API. Cookie is only sent to server
        sameSite: true, // block CORS req
        maxAge: 600000, // Time in miliseconds - 10 minutes
    }
}));

app.use(sessionInitializer);

// allow express to parse form data from requests
app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

const sessionRouter = require("./router/session");
app.use(sessionRouter.router);

const riotRouter = require("./router/riot");
app.use(riotRouter.router);

// synchronous file read for loading html pages on express start
const fs = require('fs');

// mongodb util module.
// Can be called with .query() to perform operations like insert, find etc.
const db = require("./mongodb/db");

// components
const header = fs.readFileSync(__dirname + "/public/header/header.html", "utf-8");

// pages
const frontpage = fs.readFileSync(__dirname + "/public/frontpage/frontpage.html", "utf-8");
const login = fs.readFileSync(__dirname + "/public/login/login.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html", "utf-8");
const signup = fs.readFileSync(__dirname + "/public/signup/signup.html", "utf-8");
const linkAccount = fs.readFileSync(__dirname + "/public/linkAccount/linkaccount.html")
const profile = fs.readFileSync(__dirname + "/public/profile/profile.html")

// paths for all users to access
app.get("/", (req, res) => {
    console.log(req.session)
    res.send(header + frontpage + footer);
})

app.get("/login", (req, res) => {
    res.send(header + login + footer);
})

app.get("/signup", (req, res) => {
    res.send(header + signup + footer);
})

app.get("/link-account", (req, res) => {

    res.send(header + linkAccount + footer);
})

// intercept all incoming requests with login check except above, as they are allowed for all users
app.get("/*", (req, res, next) => {
    // check if path is valid
    if (!paths.includes(req.path)) {
        res.status(404).send(header + "<h4>Sorry the page doesnt exist</h1>");
    }
    // check if user is authorized
    else if (!(req.session.loggedIn === true)) {
        res.status(401).send(header + "<h4>Sorry but you are not authorized to view this page</h1>")
    }
    else {
        next();
    }
})

// paths allowed for logged in users only
app.get("/test", (req, res) => {
    res.send(header + footer);
})

app.get("/profile", (req, res) => {
    res.send(header + profile + footer);
})

// register all valid paths
const paths = [];

// loop through all defined paths and add to array
app._router.stack.forEach( (router) => {
    if (router.route && router.route.path){
      paths.push(router.route.path + "/");
    }
})

// listen at specified port
db.connect(() => {
    server.listen(port, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("")
            console.log("[express] running in", process.env.NODE_ENV, "mode");
            console.log("[express] listening at port", port);
        }
    })
})
