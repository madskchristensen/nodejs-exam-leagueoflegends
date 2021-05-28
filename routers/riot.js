const router = require("express").Router();
const fetch = require("node-fetch");

const protocol = "https://";
const baseUrl = ".api.riotgames.com/lol/";

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

router.get("/api/riot/third-party-code/by-summoner/:encryptedId/:region", (req, res) => {
    const url = protocol + req.params.region + baseUrl + "platform/v4/third-party-code/by-summoner/" + req.params.encryptedId;

    async function fetchValidation () {
        await fetch(url, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        })
            .then(res => res.json())
            .then(validationString => res.send({ validationString }))
            .catch(err => {
                res.sendStatus(500);
            })
    }

    if (!req.params.encryptedId || !req.params.region) {
        res.sendStatus(400);
    } else {
        fetchValidation();
    }
});

module.exports = {
    router
}
