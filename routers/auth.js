const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const create = require("../mongodb/create");

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
    // node-fetch requires absolute urls, so it is necessary to get protocol and host from express
    const baseUrl = req.protocol + "://" + req.get("host");

    // endpoint variables and data posted from front-end
    const endpointSummonerDTO = "/api/riot/summoners/by-name/";
    const endpointVerificationString = "/api/riot/third-party-code/by-summoner/";
    const summonerName = req.body.summonerName;
    const region = req.body.region;
    const uuid = req.body.uuid;

    // fetches summonerDTO containing the encrypted id needed to get verification string
    async function getSummonerDTO() {
        const response = await fetch(baseUrl + endpointSummonerDTO + summonerName + "/" + region)

        return await response.json();
    }

    // fetches verification string using encrypted id
    async function getVerificationString(encryptedId) {
        const response = await fetch(baseUrl + endpointVerificationString + encryptedId + "/" + region);

        return await response.json();
    }

    // results from both api calls
    const summonerDTO = await getSummonerDTO().then(summonerDTO => summonerDTO);
    const verificationString = await getVerificationString(summonerDTO.id).then(res => res.data);

    // matches displayed uuid in front-end against the string entered in the league client of the given summoner
     // if they match it is certain the user trying to signup has access to the summoner name in question
        // therefore it is safe to set the newUser object to verified and include summonerName

    if (uuid === verificationString) {
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

    const baseUrl = req.protocol + "://" + req.get("host");

    async function getLeagueEntryDTO() {
        const response = await fetch(baseUrl + "/api/riot/league/entries/by-summoner/" + id + "/" + region)

        return await response.json();
    }

    const leagueEntryDTO = await getLeagueEntryDTO().then(leagueEntryDTO => leagueEntryDTO);
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

        res.redirect("/");

    } else {
        res.sendStatus(401);
    }
})

module.exports = {
    router
}
