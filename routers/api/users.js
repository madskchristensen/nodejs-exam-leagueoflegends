const router = require("express").Router();
const mongodb = require("../../mongodb/mongodb");

router.get("/api/users/current", (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        const user = req.session.user;
        delete user.details;

        res.status(200).send(user);

    } else {
        res.status(404).send( { error: "Logged in user not found" } );
    }
});

router.get("/api/users/:summonerName/:region", async (req, res) => {
    const summonerName = req.params.summonerName;
    const region = req.params.region;

    const user = await mongodb.findUsers.byRegionAndSummoner(region, summonerName);

    if (user) {
        delete user.details;

        res.status(200).send(user);

    } else {
        res.status(404).send( { error: "User not found" } );
    }
});

router.get("/api/users/", async (req, res) => {
    const users = await mongodb.findUsers.all();

    if (users) {
        users.forEach(user => {
            delete user._id;
            delete user.details;
        });

        res.status(200).send(users);

    } else {
        res.status(404).send( { error: "Users not found" } );
    }
});

router.put("/api/users/profile", async (req, res) => {
    const user = req.session.user;

    if (req.session.loggedIn) {
        // will return result of the update containing n modified, n found and ok fields
        const result = await mongodb.updateUsers.profile(user.riot.summonerName, user.riot.region, req.body);

        // if 1 user was found, 1 user was modified and result is ok, update was successful
        if (result.n === 1 && result.nModified === 1 && result.ok === 1) {
            res.status(200).send( { data: true } );

        } else {
            res.status(404).send( { data: false } );
        }

    } else {
        res.status(401).send( { data: false, error: "You are not authorized to access this endpoint" } );
    }
});

module.exports = {
    router
};
