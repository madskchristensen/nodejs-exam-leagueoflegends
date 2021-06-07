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
        res.sendStatus(404);
    }
});

router.get("/api/users/:summonerName/:region", async (req, res) => {
    const summonerName = req.params.summonerName;
    const region = req.params.region;

    const user = await mongodb.findUsers.byRegionAndSummoner(region, summonerName);

    if (user) {
        delete user._id;
        delete user.details;

        res.send(user);

    } else {
        res.sendStatus(404);
    }
});

router.get("/api/users/", async (req, res) => {
    const users = await mongodb.findUsers.all();

    if (users) {
        users.forEach(user => {
            delete user._id;
            delete user.details;
        });

        res.send(users);

    } else {
        res.sendStatus(404);
    }
});

router.put("/api/users/profile", async (req, res) => {
    const user = req.session.user;

    if (req.session.loggedIn) {
        // will return result of the update containing n modified, n found and ok fields
        const result = await mongodb.updateUsers.profile(user.riot.summonerName, user.riot.region, req.body);

        // if 1 user was found, 1 user was modified and result is ok, update was successful
        if (result.n === 1 && result.nModified === 1 && result.ok === 1) {
            res.send({ data: true })

        } else {
            res.send({ data: false })
        }

    } else {
        res.send({ data: false })
    }
});

module.exports = {
    router
}
