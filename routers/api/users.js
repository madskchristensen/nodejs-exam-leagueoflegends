const router = require("express").Router();
const mongodb = require("../../mongodb/mongodb");

router.get("/api/users/current", (req, res) => {
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

router.get("/api/users/:summonerName/:region", async (req, res) => {
    const summonerName = req.params.summonerName;
    const region = req.params.region;

    const user = await mongodb.find.byRegionAndSummoner(region, summonerName);

    if (user) {
        delete user._id;
        delete user.details;

        res.send(user);

    } else {
        res.sendStatus(404);
    }
})

router.post("/api/user/profile", (req, res) => {
    // brug user fra session
    console.log(req.body)
})

module.exports = {
    router
}