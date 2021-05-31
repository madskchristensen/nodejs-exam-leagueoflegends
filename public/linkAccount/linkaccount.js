// use uuid module from cdn to generate a UUID on document load, that
// the user can paste into their client for verification
function toastrSettings() {
    toastr.options.closeButton = true;
    toastr.options.timeOut = 3000;
    toastr.options.extendedTimeOut = 3000;
    toastr.options.progressBar = true;

    toastr.options.showMethod = 'slideDown';
    toastr.options.hideMethod = 'slideUp';
    toastr.options.closeMethod = 'slideUp';
}

document.addEventListener("DOMContentLoaded", function () {
    const uuidInput = document.getElementById("floatingUUID");
    uuidInput.value = uuidv4();

    toastrSettings();
});

async function linkAccount() {
    // boolean describing whether verification of summoner was successful or not
    const verified = await verifySummoner().then(res => res);

    if(verified) {
        toastr.success("Verification succeeded!")
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
    const region = regionInput.value;

    const data = {
        uuid,
        summonerName,
        region
    }

    // verify summoner on back-end and return response
    return await fetch("/auth/verify-summoner", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json());
}
