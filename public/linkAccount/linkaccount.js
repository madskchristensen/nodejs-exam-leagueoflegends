// kald /lol/summoner/v4/summoners/by-name/{summonerName}
// modtag SummonerDTO som indeholder id (encrypted Summoner id)
// kald /lol/platform/v4/third-party-code/by-summoner/{encryptedSummonerId}
// modtag string som bruger har indtastet i sin league client under verification
// check om string matcher med string i UUID input
// Hvis ja
// Gem account i db
// Hvis nej
// Vis fejl
async function sendFormData() {
    const uuidInput = document.getElementById("floatingUUID");
    const uuid = uuidInput.value;

    const summonerNameInput = document.getElementById("floatingSummonerName");
    const summonerName = summonerNameInput.value;

    const regionInput = document.getElementById("region");
    const region = getRegionCode(regionInput.value);

    const summonerId = await fetchEncryptedId(summonerName, region)
        .then(summonerDTO => summonerDTO.id);

    await fetchValidationString(summonerId, region)
        .then(res => {
            if (res.validationString === uuid) {
                console.log("Validation OK")
            } else {
                console.log("Validation failed")
            }
        });
}

async function fetchValidationString(summonerId, region) {
    const response = await fetch("/api/riot/third-party-code/by-summoner/" + summonerId + "/" + region);

    return await response.json();
}

async function fetchEncryptedId(summonerName, region) {
    const response = await fetch("/api/riot/summoners/by-name/" + summonerName + "/" + region);

    return await response.json();
}

// should be refactored into riot api or something later on...
// https://leagueoflegends.fandom.com/wiki/Servers
function getRegionCode(region) {
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
