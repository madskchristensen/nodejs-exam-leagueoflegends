// used to fetch from riots api
const fetch = require("node-fetch");

// variables used in all functions
const protocol = "https://";
const baseUrl = ".api.riotgames.com/lol/";
const headers = { "X-Riot-Token": process.env.RIOT_API_KEY };

// All functions ideally return the result of the fetch call, usually containing an object with the value
// Naming schemes have been kept consistent with Riots API where possible
// If an error occours in the fetch call an error object will be returned
    // containing the http status and response from riot

// fetches summonerDTO (containing encrypted id, level etc.)
async function getSummonerDTO(region, summonerName) {
    const endPoint = "summoner/v4/summoners/by-name/";
    const url = protocol + region + baseUrl + endPoint + summonerName;

    const summonerDTO = await fetch(url, { headers })
        .then(res => res.json())
        .then(summonerDTO => summonerDTO)
        .catch(error => { error });

    return summonerDTO;
}

// fetches verification string that a user has entered in their riot client
async function getVerification(region, encryptedId) {
    const endPoint = "platform/v4/third-party-code/by-summoner/";
    const url = protocol + region + baseUrl + endPoint + encryptedId;

    const verification = await fetch(url, { headers })
        .then(res => res.json())
        .then(verification => verification)
        .catch(error => { error });

    return verification;
}

// fetches all league rankings for a user (flex, solo etc.)
async function getLeagueEntryDTO(region, encryptedId) {
    const endPoint = "league/v4/entries/by-summoner/";
    const url = protocol + region + baseUrl + endPoint + encryptedId;

    const leagueEntryDTO = await fetch(url, {headers})
        .then(res => res.json())
        .then(leagueEntryDTO => leagueEntryDTO)
        .catch(error => {
            error
        });

    return leagueEntryDTO;
}

// matches value of selected option in the region <select> element
// and returns a region code that can be used with the riot api
// https://developer.riotgames.com/docs/lol#_routing-values
function translateRegion(region) {
    switch(region) {
        case "EUW":
            return "euw1";
        case "NA":
            return "na1";
        case "EUNE":
            return "eun1";
        case "KR":
            return "kr";
        case "BR":
            return "br1";
        case "LAN":
            return "la1";
        case "LAS":
            return "la2";
        case "OCE":
            return "oc1";
        case "RU":
            return "ru";
        case "TR":
            return "tr1";
        case "JP":
            return "jp1";
    }
}

module.exports = {
    getSummonerDTO,
    getVerification,
    getLeagueEntryDTO,
    translateRegion
}
