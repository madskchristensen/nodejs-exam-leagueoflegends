// dotenv setup
/*
const dotenvResult = require("dotenv").config();
    console.log(dotenvResult);    

if (dotenvResult.error) {
    throw dotenvResult.error;
}*/

// express setup
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// socket.io setup
// wrap express in plain node.js http server
const server = require("http").createServer(app);

// atttach socket.io to http server
const io = require("socket.io")(server);

// attach rootSocket to socket.io attached to server
require('./socketio')(io);

// save helmet to const
const helmet = require("helmet");

// assign express-session to session const
const session = require("express-session");

// set sessionOptions
const sessionOptions = session({
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
});

// middleware that sets needed variables in the session
const sessionInitializer = function (req, res, next) {
    if (!req.session.loggedIn) {
        req.session.loggedIn = false;
    }

    next();
}

// register session in Socket.IO, so we can get session in socket.io functions
// reference: https://socket.io/docs/v3/faq/ - how to use socket.io with express-session
io.use((socket, next) => {
    sessionOptions(socket.request, {}, next);
});

// use helmet for better security
// contentSecurityPolicy needs to be configured, otherwise scripts, styles etc. wont be allowed from cdns
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "script-src": ["'self'", "*.fontawesome.com", "*.jquery.com", "*.jsdelivr.net", "*.cloudflare.com", "'unsafe-inline'"],
            "connect-src": ["'self'", "ka-f.fontawesome.com"],
            "style-src": ["'self'", "*.fontawesome.com", "*.jsdelivr.net", "*.cloudflare.com", "'unsafe-inline'"], // unsafe-inline needed to allow fontawesome icons
            "font-src": ["'self'", "*.fontawesome.com"],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "ddragon.leagueoflegends.com", "data: w3.org"]
        }
    }));

// apply sessionOptions to the app
app.use(sessionOptions);

// make app use the sessionInitializer
app.use(sessionInitializer);

// allow static content to be served
app.use(express.static("public"));

// allow express to parse form data from requests
app.use(express.urlencoded({
    extended: true
}));

// allow express to parse json
app.use(express.json());

// routers
const sessionRouter = require("./routers/api/session");
app.use(sessionRouter.router);

const authRouter = require("./routers/auth");
app.use(authRouter.router);

const userRouter = require("./routers/api/users");
app.use(userRouter.router);

// synchronous file read for loading html pages on express start
const fs = require('fs');

// mongodb util module.
// allows us to create a single connection that the app will use
const db = require("./mongodb/db");

const views = "/public/views/";

// html pages
const frontpage = fs.readFileSync(__dirname + views + "/frontpage/frontpage.html", "utf-8");
const login = fs.readFileSync(__dirname + views +  "/login/login.html", "utf-8");
const signup = fs.readFileSync(__dirname + views +  "/signup/signup.html", "utf-8");
const linkAccount = fs.readFileSync(__dirname + views + "/linkAccount/linkaccount.html", "utf-8");
const profile = fs.readFileSync(__dirname + views +  "/profile/profile.html", "utf-8");
const messenger = fs.readFileSync(__dirname + views +  "/messenger/messenger.html", "utf-8");

// html components
const header = fs.readFileSync(__dirname + views +  "/header/header.html", "utf-8");
const footer = fs.readFileSync(__dirname + views +  "/footer/footer.html", "utf-8");

// paths for all users to access
app.get("/", (req, res) => {
    res.send(header + frontpage + footer);
});

app.get("/login", (req, res, next) => {
        res.send(header + login + footer);
});

app.get("/signup", (req, res) => {
    // check is user is already signed in
    if (req.session.loggedIn) {
        res.status(401).send(header + "<h4 class='text-center'>You are already logged in. Please logout before signing up as a new user</h1>")
    
    } else {
        res.send(header + signup + footer);
    }
});

app.get("/link-account", (req, res) => {
    res.send(header + linkAccount + footer);
});

app.get("/profile/:summonerName/:region", (req, res) => {
    res.send(header + profile + footer);
});

// intercept all incoming requests with login check except above, as they are allowed for all users
app.get("/*", (req, res, next) => {

    // print the path that endpoint sees
    console.log("looking at", req.path);

    // save path to variable where it can be changed
    let newPath = req.path;

    // remove trailin slash from messenger --- temp fix until we fix bug
    if (req.path.charAt(req.path.length - 1) === "/") {
        newPath = req.path.slice(0, -1);
    }

    // check if path is valid
    if (!paths.includes(newPath)) {
        res.status(404).send(header + "<h4 class='text-center'>Sorry the page doesnt exist</h1>");
    
        // check if user is authorized
    } else if (!req.session.loggedIn) {
        res.status(401).send(header + "<h4 class='text-center'>Please login to view this page</h1>");

    } else {
        next();
    }
});

app.get("/messenger", (req, res) => {
    res.send(header + messenger + footer);
});

// register all valid paths
const paths = [];

// loop through all defined paths and add to array
app._router.stack.forEach( (router) => {
    if (router.route && router.route.path){
        console.log("from router loop", router.route.path)

        paths.push(router.route.path);
    }
})

// wrap server.listen call in db.connect call to always have an active connection
// listen at specified port
db.connect(() => {
    server.listen(port, (err) => {
        if (err) {
            console.log(err);

        } else {
            console.log("[express] running in", process.env.NODE_ENV, "mode");
            console.log("[express] listening at port", port);
            console.log("");
        }
    })
})
