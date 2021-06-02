const router = require("express").Router();
const mongodb = require("../../mongodb/mongodb");

router.get("/api/user", (req, res) => {
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

router.get("/api/user/:region/:summonerName", async(req, res) => {
    const region = req.params.region;
    const summonerName = req.params.summonerName;

    console.log(req.originalUrl)

    const user = await mongodb.find.byRegionAndSummoner(region, summonerName);

    delete user._id;
    delete user.details;

    res.send(user);
})

router.post("/api/user/profile", (req, res) => {
    // brug user fra session
    console.log(req.body)
})

module.exports = {
    router
}
