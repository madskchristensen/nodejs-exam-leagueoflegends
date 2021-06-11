const bcrypt = require("bcrypt");
const mongodb = require("../mongodb/mongodb");
const riot = require("../service/riot");

const saltRounds = 10;

const router = require("express").Router();

router.get("/auth/is-logged-in", (req, res) => {
    const loggedIn = req.session.loggedIn;
    
    res.send( { data: loggedIn } );
});

// endpoint that is called when a user tries to log in
router.post("/auth/login", async (req, res) => {
    const password = req.body.password;
    const email = req.body.email;

    const user = await mongodb.findUsers.byEmail(email);

    // if user was found
    if (user) {
        // get users password from found user
        const hashedPassword = user.details.password;

        // compare password from front-end with encrypted password in user from db
        const passwordMatches = await bcrypt.compare(password, hashedPassword)
            .then(res => res)
            .catch(err => err);

        // if passwords match user will be logged in
        if (passwordMatches) {
            console.log("Client login accepted:", req.session.id);

            req.session.loggedIn = true;
            req.session.user = user;

            const profileUrl = "/profile/" + user.riot.summonerName + "/" + user.riot.region;

            res.redirect(profileUrl);

            // if passwords don't match, redirect to login page and don't log in user
        } else {
            console.log("Client login rejected (wrong password):", req.session.id);

            res.redirect("/login?error=Wrong email and/or password");
        }

        // if user was not found redirect to login
    } else {
        console.log("Client login rejected (user not found):", req.session.id);

        res.redirect("/login?error=Wrong email and/or password");
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

router.post("/auth/signup", async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const user = await mongodb.findUsers.byEmail(email);

    // if user was found using email, show error
    if (user) {
        res.redirect("/signup?error=Email already exists");

    } else {
        bcrypt.hash(password, saltRounds,(err, hashedPassword) => {
            // let express handle the error and show it to the user.
            // if NODE_ENV is set to development the stack trace will be shown in browser
            // if set to production a "500 internal server error" will be displayed
            if (err) {
                next(err);

            } else {
                req.session.newUser = {
                    email: email,
                    password: hashedPassword,
                    verified: false
                }

                res.redirect("/link-account");
            }
        });
    }
});

// endpoint called from linkaccount.js during signup process to verify if a given summonerName belongs to the user
router.post("/auth/verify-summoner", async (req, res) => {
    const summonerName = req.body.summonerName;
    const region = req.body.region.toLowerCase();
    const regionTranslated = riot.translateRegion(region);
    const uuid = req.body.uuid;

    // find user from db, if exists
    const user = await mongodb.findUsers.byRegionAndSummoner(region, summonerName);

    // if user exists, show error
    if (user) {
        if (user.riot.summonerName === summonerName && user.riot.region === region) {
            res.send( { result: false, error: "User with summoner name and region already exists." } )
        }

    } else {
        // get summonerDTO and verification string from riot service
        const summonerDTO = await riot.getSummonerDTO(regionTranslated, summonerName);
        const verification = await riot.getVerification(regionTranslated, summonerDTO.id);

        // matches displayed uuid in front-end against the string entered in the league client of the given summoner
        // if they match it is certain the user trying to signup has access to the summoner name in question
        // therefore it is safe to set the newUser object to verified and add any remaining riot information
        if (uuid === verification) {
            req.session.newUser.verified = true;
            req.session.newUser.summonerName = summonerName;
            req.session.newUser.region = region.toLowerCase();
            req.session.newUser.regionTranslated = regionTranslated;
            req.session.newUser.profileIconId = summonerDTO.profileIconId;
            req.session.newUser.summonerLevel = summonerDTO.summonerLevel;
            req.session.newUser.encryptedId = summonerDTO.id;

            // everything went okay so send result = true and no error
            res.send( { result: true, error: "" } );

        // verification string didnt match and so send error
        } else {
            res.send( { result: false, error: "Verification text didn't match." } );
        }
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
                }
            },
            details: {
                email: req.session.newUser.email,
                password: req.session.newUser.password
            }
        };

        // insert ranked data if summoner is ranked in 5v5 solo
        if (rankedSolo) {
            data.riot.rankedSolo5x5 = {
                tier: rankedSolo.tier,
                rank: rankedSolo.rank,
                leaguePoints: rankedSolo.leaguePoints,
                wins: rankedSolo.wins,
                losses: rankedSolo.losses
            }
        };

        // save data object to db
        mongodb.insertUsers.user(data);

        // delete the newUser object from session as it will no longer be used
        delete req.session.newUser;

        // redirect to frontpage and show success message
        res.redirect("/login?success=User created successfully!");

    // if verified is not set for some weird reason, redirect to start of signup
    } else {
        res.redirect("/signup?error=Something went wrong. Please try again.");
    }
});

module.exports = {
    router
};
