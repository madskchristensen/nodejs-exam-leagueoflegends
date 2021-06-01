const router = require("express").Router();
const mongodb = require("../mongodb/mongodb");

router.get("/user", (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        const user = req.session.user;
        delete user.details;
        delete user._id;

        res.send(user);

    } else {
        res.sendStatus(401);
    }
})

router.get("/user/:region/summonerName", (req, res) => {
    const region = req.params.region;
    const summonerName = req.params.summonerName;


})

module.exports = {
    router
}
