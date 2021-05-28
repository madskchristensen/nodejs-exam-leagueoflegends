const bcrypt = require("bcrypt");
const fetch = require("node-fetch");

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
            req.session.newAccount = {
                email: req.body.email,
                password: hashedPassword,
                verified: false
            }

            res.redirect("/link-account");
        }
    });
})

router.post("/auth/verify-summoner", async (req, res) => {
    const baseUrl = req.protocol + "://" + req.get("host");
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
    async function getVerificationString() {
        const response = await fetch(baseUrl + endpointVerificationString + summonerIdEncrypted + "/" + region);

        return await response.json();
    }

    // results from both api calls
    const summonerIdEncrypted = await getSummonerDTO().then(summonerDTO => summonerDTO.id);
    const verificationString = await getVerificationString().then(res => res.string);

    // matches displayed uuid in front-end against the string entered in the league client of the given summoner
     // if they match it is certain the user trying to signup has access to the summoner name in question
        // therefore it is safe to set the newAccount object to verified and include summonerName
    if (uuid === verificationString) {
        req.session.newAccount.verified = true;
        req.session.newAccount.summonerName = summonerName;
        res.send(true);
    } else {
        res.send(false);
    }
})

module.exports = {
    router
}
