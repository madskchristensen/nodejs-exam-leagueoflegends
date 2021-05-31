const bcrypt = require("bcrypt");
const create = require("../mongodb/create");
const riot = require("../riot/riot")

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
            req.session.newUser = {
                email: req.body.email,
                password: hashedPassword,
                verified: false
            }

            res.redirect("/link-account");
        }
    });
});

router.post("/auth/verify-summoner", async (req, res) => {
    const summonerName = req.body.summonerName;
    const region = req.body.region;
    const uuid = req.body.uuid;

    const summonerDTO = await riot.getSummonerDTO(region, summonerName);
    const verification = await riot.getVerification(region, summonerDTO.id);

    // matches displayed uuid in front-end against the string entered in the league client of the given summoner
    // if they match it is certain the user trying to signup has access to the summoner name in question
    // therefore it is safe to set the newUser object to verified and include summonerName
    if (uuid === verification) {
        req.session.newUser.verified = true;
        req.session.newUser.summonerName = summonerName;
        req.session.newUser.region = region;
        req.session.newUser.profileIconId = summonerDTO.profileIconId;
        req.session.newUser.summonerLevel = summonerDTO.summonerLevel;
        req.session.newUser.encryptedId = summonerDTO.id;

        res.send(true);

    } else {
        res.send(false);
    }
});

router.get("/auth/create-user", async (req, res) => {
    const newUser = req.session.newUser;
    const region = newUser.region;
    const id = newUser.encryptedId;

    const leagueEntryDTO = await riot.getLeagueEntryDTO(region, id);
    const rankedSolo = leagueEntryDTO.find(element => element.queueType === "RANKED_SOLO_5x5");

    if(req.session.newUser.verified) {
        const data = {
            profile: {
                age: "",
                languages: "",
                country: "",
                roles: "",
                description: ""
            },
            riot: {
                summonerName: newUser.summonerName,
                profileIconId: newUser.profileIconId,
                summonerLevel: newUser.summonerLevel,
                region: newUser.region,
                rankedSolo5x5: {
                    tier: rankedSolo.tier,
                    rank: rankedSolo.rank,
                    leaguePoints: rankedSolo.leaguePoints,
                    wins: rankedSolo.wins,
                    losses: rankedSolo.losses
                }
            },
            details: {
                email: req.session.newUser.email,
                password: req.session.newUser.password
            }
        }

        create.user(data);

        // delete the newUser object from session as it will no longer be used
        delete req.session.newUser;

        res.redirect("/");

    } else {
        res.sendStatus(401);
    }
})

module.exports = {
    router
}
