const bcrypt = require("bcrypt");
const mongo = require("../mongodb/mongodb");
const riot = require("../service/riot")

const saltRounds = 10;

const router = require("express").Router();

router.get("/auth/is-logged-in", (req, res) => {
    const loggedIn = req.session.loggedIn;

    res.send({loggedIn});
})

// endpoint that is called when a user tries to log in
router.post("/auth/login", async (req, res) => {
    const password = req.body.password;
    const email = req.body.email;

    const user = await mongo.findUsers.byEmail(email);

    // if user was found
    if (user) {
        // get users password from found user
        const hashedPassword = user.details.password;

        // compare password from front-end with encrypted password in user from db
        const passwordMatches = await bcrypt.compare(password, hashedPassword)
            .then(res => res)
            .catch(err => err);

        // if passwords match user will be logged in
        if(passwordMatches) {
            console.log("Client login accepted:", req.session.id);

            req.session.loggedIn = true;
            req.session.user = user;

            const profileUrl = "/profile/" + user.riot.summonerName + "/" + user.riot.region;

            res.redirect(profileUrl);

            // if passwords don't match, redirect to login page and don't log in user
        } else {
            console.log("Client login rejected (wrong password)", req.session.id);

            res.redirect("/login");
        }

        // if user was not found redirect to login
    } else {
        res.redirect("/login");
    }
});

// endpoint that is called when a user attempts to sign out
router.post("/auth/signout", (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        req.session.loggedIn = false;

        // if user object exists in session, make sure to delete it
        if (req.session.user) {
            delete req.session.user;
        }

        console.log("Client successfully logged out using sessionID: " + req.session.id);
    }

    res.redirect("/");
});

router.post("/auth/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, saltRounds,(err, hashedPassword) => {
        // let express handle the error and show it to the user.
        // if NODE_ENV is set to development the stack trace will be shown in browser
        // if set to production a "500 internal server error" will be displayed
        if (err) {
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

// endpoint called during sign-up process to verify if a given summonerName belongs to the user
router.post("/auth/verify-summoner", async (req, res) => {
    const summonerName = req.body.summonerName;
    const region = req.body.region.toLowerCase();
    const regionTranslated = riot.translateRegion(region);
    const uuid = req.body.uuid;

    const summonerDTO = await riot.getSummonerDTO(regionTranslated, summonerName);
    const verification = await riot.getVerification(regionTranslated, summonerDTO.id);

    // matches displayed uuid in front-end against the string entered in the league client of the given summoner
    // if they match it is certain the user trying to signup has access to the summoner name in question
    // therefore it is safe to set the newUser object to verified and include summonerName
    if (uuid === verification) {
        req.session.newUser.verified = true;
        req.session.newUser.summonerName = summonerName;
        req.session.newUser.region = region.toLowerCase();
        req.session.newUser.regionTranslated = regionTranslated;
        req.session.newUser.profileIconId = summonerDTO.profileIconId;
        req.session.newUser.summonerLevel = summonerDTO.summonerLevel;
        req.session.newUser.encryptedId = summonerDTO.id;

        res.send(true);

    } else {
        res.send(false);
    }
});

// endpoint called during sign-up process when a users summonerName is verified
// and the user should be saved to database
router.get("/auth/create-user", async (req, res) => {
    const newUser = req.session.newUser;
    const region = newUser.region;
    const regionTranslated = riot.translateRegion(region);
    const id = newUser.encryptedId;

    // get leagueEntryDTO array (containing solo 5v5, flex 5v5 tier, lp, wins/losses etc.)
    const leagueEntryDTO = await riot.getLeagueEntryDTO(regionTranslated, id);
    // find rankedSolo object from the array
    const rankedSolo = leagueEntryDTO.find(element => element.queueType === "RANKED_SOLO_5x5");

    // if summoner was verified, create data object containing profile, summoner/service and user/details data
    if (req.session.newUser.verified) {
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

        // save data object to db
        mongo.insertUsers.user(data);

        // delete the newUser object from session as it will no longer be used
        delete req.session.newUser;

        res.redirect("/");

    } else {
        res.sendStatus(401);
    }
});

module.exports = {
    router
}
