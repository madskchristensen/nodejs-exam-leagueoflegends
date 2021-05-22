const router = require("express").Router();

router.get("/getSession", (req, res) => {
    res.send({ session: req.session });
});

router.post("/api/login", (req, res) => {
    // TO DO
    // fetch req.body and validate login

    // standin login validation. Just sets ression.loggedin to true
    console.log("Client successfully logged in using sessionID: " + req.session.id);
    req.session.loggedIn = true;
    res.redirect("/");
});

router.post("/api/signout", (req, res) => {
    // standin signout validation. Just sets ression.loggedin to false
    console.log("Client successfully logged out using sessionID: " + req.session.id);
    req.session.loggedIn = false;
    res.redirect("/");
});


module.exports = {
    router
}