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

// get id (encryptedSummonerId), accountid, puuid, name, icon, level from summoner name:
// example:
/*{
    "id": "BEsb46AqqiMs_uErSzdKVhXcXGlXjG8K0VQNqDukDHpcFok",
    "accountId": "IyErNlkxHxxXNuZ5V9NGecGfcW8rX_6iCrzII-JDldrThQ",
    "puuid": "vF0MzlklDjeCaUK-UHrMU-GtYjvn43TFamn-S6DrGjkS7oFg-G5WzqJcsBTC4jKEGFTylh0Q2CwOeQ",
    "name": "MichaelMedStortM",
    "profileIconId": 556,
    "revisionDate": 1621974698000,
    "summonerLevel": 167
}*/
// /lol/summoner/v4/summoners/by-name/{summonerName}


// get league rank, tier, lp etc.
//Example:
/*[
    {
        "leagueId": "fdce77e3-710c-466c-81ac-8f295b7605ba",
        "queueType": "RANKED_FLEX_SR",
        "tier": "GOLD",
        "rank": "II",
        "summonerId": "wCuECY9FEPllFCbNZssm4uELjaWp93k0WZRDjbx2WzhKRi0",
        "summonerName": "Lycate",
        "leaguePoints": 68,
        "wins": 21,
        "losses": 13,
        "veteran": false,
        "inactive": false,
        "freshBlood": false,
        "hotStreak": false
    },
    {
        "leagueId": "546a3222-84e1-4143-93ff-0d7db3cb58f9",
        "queueType": "RANKED_SOLO_5x5",
        "tier": "PLATINUM",
        "rank": "IV",
        "summonerId": "wCuECY9FEPllFCbNZssm4uELjaWp93k0WZRDjbx2WzhKRi0",
        "summonerName": "Lycate",
        "leaguePoints": 1,
        "wins": 32,
        "losses": 20,
        "veteran": false,
        "inactive": false,
        "freshBlood": false,
        "hotStreak": true
    }
]*/
// /lol/league/v4/entries/by-summoner/{encryptedSummonerId}


module.exports = {
    router
}
