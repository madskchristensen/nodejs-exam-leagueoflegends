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
            "style-src": ["'self'", "*.fontawesome.com", "*.jsdelivr.net", "*.cloudflare.com", "'unsafe-inline'"], // unsafe-inline needed to allow fontawesome icons
            "font-src": ["'self'", "*.fontawesome.com"],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "ddragon.leagueoflegends.com", "data: w3.org"]
        }
    }));

// escapeHtml
const escapeHtml = require("html-escaper").escape;

// socket.io setup
// wrap express in plain node.js http server
const server = require("http").createServer(app);

// atttach socket.io to http server
const io = require("socket.io")(server);

const chatService = require("./service/chats");

// register middleware in Socket.IO
// reference: https://socket.io/docs/v3/faq/ - how to use socket.io with express-session
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
    console.log("A socket connected with id" + socket.id);

    // create username from session
    socket.data.summonerName = socket.request.session.user.riot.summonerName;
    socket.data.region = socket.request.session.user.riot.region;

    socket.data.username = socket.data.summonerName + "-" + socket.data.region;
    
    // get user from session
    const userFromSession = socket.request.session.user;

    // join room with username
    socket.join(socket.data.username);

    socket.on("private message", async (data) => {
        // send message to other user
        data.from = userFromSession;

        const response = await chatService.saveMessage(data);

        if (response.data) {
            socket.to(data.to.riot.summonerName + "-" + data.to.riot.region).emit("private message", {
                message: escapeHtml(data.message),
                from: socket.request.session.user,
                to: data.to,
                toSelf: false
            });
            io.in(socket.data.username).emit("private message", {
                message: escapeHtml(data.message),
                from: data.to,
                to: socket.request.session.user,
                toSelf: true
            });
        } 
    });

    socket.on("disconnect", async () => {
        console.log("A socket disconnected" + socket.data.username);
    })
});

// escapehtml setup
const escapeHTML = require("html-escaper").escape;

// node-fetch setup
const fetch = require("node-fetch");

// session setup
// create session 
const session = require("express-session");

const sessionMiddleware = session({
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

app.use(sessionMiddleware);

// middleware that sets needed variables in the session
const sessionInitializer = async function (req, res, next) {
    /*if (process.env.NODE_ENV === "development") {
        const mongodb = require("./mongodb/mongodb");

        req.session.user = await mongodb.findUsers.byEmail("michael@fuglo.com");
        req.session.loggedIn = true;
    }*/

    if (!req.session.loggedIn) {
        req.session.loggedIn = false;
    }

    next();
}

app.use(sessionInitializer);

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

const messagesRouter = require("./routers/api/chats");
app.use(messagesRouter.router);

// synchronous file read for loading html pages on express start
const fs = require('fs');

// mongodb util module.
// Can be called with .query() to perform operations like insert, find etc.
const db = require("./mongodb/db");

// pages
const frontpage = fs.readFileSync(__dirname + "/public/frontpage/frontpage.html", "utf-8");
const login = fs.readFileSync(__dirname + "/public/login/login.html", "utf-8");
const signup = fs.readFileSync(__dirname + "/public/signup/signup.html", "utf-8");
const linkAccount = fs.readFileSync(__dirname + "/public/linkAccount/linkaccount.html");
const profile = fs.readFileSync(__dirname + "/public/profile/profile.html");
const messenger = fs.readFileSync(__dirname + "/public/messenger/messenger.html");

// components
const header = fs.readFileSync(__dirname + "/public/header/header.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html", "utf-8");

// paths for all users to access
app.get("/", (req, res) => {
    res.send(header + frontpage + footer);
});

app.get("/login", (req, res, next) => {
        res.send(header + login + footer);
});

app.get("/signup", (req, res) => {
    // check is user is already signed in
    if (req.session.loggedIn === true) {
        res.status(401).send(header + "<h4>You are already logged in. Please logout before signing up as a new user</h1>")
    
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
    // check if path is valid
    if (!paths.includes(req.path)) {
        res.status(404).send(header + "<h4>Sorry the page doesnt exist</h1>");
    
        // check if user is authorized
    } else if (!(req.session.loggedIn === true)) {
        res.status(401).send(header + "<h4>Please login to view this page</h1>");

    } else {
        next();
    }
});

app.get("/messenger", (req, res) => {
    res.send(header + messenger + footer);
});

// intercept all incoming requests with login check except above, as they are allowed for all users
app.get("/*", (req, res, next) => {
    // check if path is valid
    if (!paths.includes(req.path)) {
        res.status(404).send(header + "<h4>Sorry the page doesnt exist</h1>");
    }

})

// register all valid paths
const paths = [];

// loop through all defined paths and add to array
app._router.stack.forEach( (router) => {
    if (router.route && router.route.path){
        paths.push(router.route.path + "/");
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
