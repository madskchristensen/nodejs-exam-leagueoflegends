const bcrypt = require("bcrypt");

const router = require("express").Router();

router.post("/auth/login", (req, res) => {
    // TO DO
    // fetch req.body and validate login

    // standin login validation. Just sets ression.loggedin to true
    console.log("Client successfully logged in using sessionID: " + req.session.id);
    req.session.loggedIn = true;
    res.redirect("/");
});

router.post("/auth/signout", (req, res) => {
    // standin signout validation. Just sets ression.loggedin to false
    console.log("Client successfully logged out using sessionID: " + req.session.id);
    req.session.loggedIn = false;
    res.redirect("/");
});

router.post("/auth/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10,(err, hashedPassword) => {
        // let express handle the error and show it to the user.
        // if NODE_ENV is set to development the stack trace will be shown in browser
        // if set to production a "500 internal server error" will be displayed
        if(err) {
            next(err);

        } else {
            req.session.newAccount = {
                email: req.body.email,
                password: hashedPassword
            }

            res.redirect("/link-account");
        }
    });
})

router.get("/auth/link-account", (req, res) => {
    console.log("hey")
})

module.exports = {
    router
}
