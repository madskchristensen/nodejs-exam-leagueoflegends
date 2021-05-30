const router = require("express").Router();
const fetch = require("node-fetch");

const protocol = "https://";
const baseUrl = ".api.riotgames.com/lol/";

// fetches summonerDTO (containing encrypted id etc.)
router.get("/api/riot/summoners/by-name/:summonerName/:region", (req, res) => {
    const url = protocol + req.params.region + baseUrl + "summoner/v4/summoners/by-name/" + req.params.summonerName;

    async function fetchSummonerDTO () {
        await fetch(url, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        })
            .then(res => res.json())
            .then(summonerDTO => res.send(summonerDTO))
            .catch(err => {
                res.sendStatus(500);
            });
    }

    if (!req.params.summonerName || !req.params.region) {
        res.sendStatus(400);
    } else {
        fetchSummonerDTO();
    }
});

// fetches verification string that a league of legends user has inputted in their client
router.get("/api/riot/third-party-code/by-summoner/:encryptedId/:region", (req, res) => {
    const url = protocol + req.params.region + baseUrl + "platform/v4/third-party-code/by-summoner/" + req.params.encryptedId;

    async function fetchValidation () {
        await fetch(url, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        })
            .then(res => res.json())
            .then(validationString => res.send({data: validationString}))
            .catch(err => res.sendStatus(500));
    }

    if (!req.params.encryptedId || !req.params.region) {
        res.sendStatus(400);
    } else {
        fetchValidation();
    }
});

router.get("/api/riot/league/entries/by-summoner/:encryptedId/:region", (req, res) => {
    const url = protocol + req.params.region + baseUrl + "league/v4/entries/by-summoner/" + req.params.encryptedId;

    async function fetchLeagues() {
        await fetch(url, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        })
            .then(res => res.json())
            .then(leagueEntryDTO => res.send(leagueEntryDTO))
            .catch(err => res.sendStatus(500));
    }

    if (!req.params.encryptedId || !req.params.region) {
        res.sendStatus(400);
    } else {
        fetchLeagues();
    }
})

module.exports = {
    router
}
