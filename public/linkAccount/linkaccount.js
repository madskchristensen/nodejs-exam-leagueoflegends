// use uuid module from cdn to generate a UUID on document load, that
// the user can paste into their client for verification
document.addEventListener("DOMContentLoaded", function() {
    const uuidInput = document.getElementById("floatingUUID");
    uuidInput.value = uuidv4();


    toastr.options.closeButton = true;
    toastr.options.timeOut = 3000;
    toastr.options.extendedTimeOut = 3000;
    toastr.options.progressBar = true;

    toastr.options.showMethod = 'slideDown';
    toastr.options.hideMethod = 'slideUp';
    toastr.options.closeMethod = 'slideUp';
})

async function linkAccount() {
    // boolean describing whether verification of summoner was successful or not
    const verified = await verifySummoner().then(res => res);

    console.log(verified);

    if(verified) {
        window.location.href = "/auth/create-user"

    } else {
        toastr.error("Verification failed.")
    }
}

async function verifySummoner() {
    const uuidInput = document.getElementById("floatingUUID");
    const uuid = uuidInput.value;

    const summonerNameInput = document.getElementById("floatingSummonerName");
    const summonerName = summonerNameInput.value;

    const regionInput = document.getElementById("region");
    const region = getRegionCode(regionInput.value);

    const data = {
        uuid,
        summonerName,
        region
    }

    // fetch validation
    return await fetch("/auth/verify-summoner", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json());
}

// should be refactored into riot api or something later on...
// matches value of selected option in the region <select> element
// and returns a region code that can be used with the riot api
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
