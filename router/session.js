const router = require("express").Router();

router.get("/getSession", (req, res) => {
    res.send({ session: req.session });
});

router.post("/api/auth/login", (req, res) => {
    // TO DO
    // fetch req.body and validate login

    // standin login validation. Just sets ression.loggedin to true
    console.log("Client successfully logged in using sessionID: " + req.session.id);
    req.session.loggedIn = true;
    res.redirect("/");
});

router.post("/api/auth/signout", (req, res) => {
    // standin signout validation. Just sets ression.loggedin to false
    console.log("Client successfully logged out using sessionID: " + req.session.id);
    req.session.loggedIn = false;
    res.redirect("/");
});

router.post("/api/auth/signup", (req, res) => {
    req.session.newAccount = {
        email: req.body.email,
        password: req.body.password
    }

    res.redirect("/link-account");
})

router.post("/api/auth/link-account", (req, res) => {
    // kald /lol/summoner/v4/summoners/by-name/{summonerName}
        // modtag SummonerDTO som indeholder id (encrypted Summoner id)
    // kald /lol/platform/v4/third-party-code/by-summoner/{encryptedSummonerId}
        // modtag string som bruger har indtastet i sin league client under verification
    // check om string matcher med string i UUID input
        // Hvis ja
            // Gem account i db
        // Hvis nej
            // Vis fejl
})


module.exports = {
    router
}
