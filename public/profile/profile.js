(async function getProfile() {
    try {
        // DATA SETUP //

        // Is user logged in?
        const loggedIn = await isLoggedIn().then(result => result.data);

        // Get user data for the profile being viewed
        const userProfile = await getUserProfile();

        // Currently logged in user. Will be initialized later in the script if loggedIn is true
        let userLoggedIn;

        // Append hardcoded season stats to user as it has not been implemented yet
        userProfile.riot.seasonStats = [
            {
                champion: "Alistar",
                winRate: "55%",
                gamesPlayed: "64",
                KDA: "2.78"
            },
            {
                champion: "Rell",
                winRate: "64%",
                gamesPlayed: "61",
                KDA: "2.47"
            },
            {
                champion: "Rammus",
                winRate: "85%",
                gamesPlayed: "99",
                KDA: "10.78"
            },
            {
                champion: "Ekko",
                winRate: "45%",
                gamesPlayed: "8",
                KDA: "2.78"
            }
        ];

        // LOAD PROFILE INFORMATION //
        loadProfile(userProfile);

        // MESSAGE BUTTON //

        // create elements related to message button
        const buttonWrapper = document.getElementById("button-wrapper");
        const messageButton = document.createElement("button");
        const messageLink = document.createElement("a");

        // set classes that apply in all cases for button
        messageButton.classList.add("btn", "mb-3");

        // by default make messageLink go to nothing
        messageLink.href = "#";

        messageButton.appendChild(messageLink);

        // CONDITIONS FOR MESSAGE BUTTON //
        // if logged in and not viewing own profile -> show message button
        // if logged in and viewing own profile -> don't show message button
        // if not logged in -> show disabled message button
        if (loggedIn) {
            userLoggedIn = await getUser();

            // if logged in user is not same as user being viewed -> allow to message
            if (userProfile.riot.summonerName !== userLoggedIn.riot.summonerName) {
                messageLink.href = "/messenger";
                messageButton.classList.add("btn-success")
                messageButton.innerText = "Message";

                buttonWrapper.appendChild(messageButton);
            }

        // if user is not logged in -> don't allow to message
        } else {
            messageButton.disabled = true;
            messageButton.innerText = "Login to message";
            messageButton.classList.add("btn-secondary")

            buttonWrapper.appendChild(messageButton);
        }

        // allow user to edit profile information and save it,
        // if they are logged in and profile is their own
        if (loggedIn && userProfile.riot.summonerName === userLoggedIn.riot.summonerName) {
            enableProfileEditing();
        }

    } catch (error) {
        // show toastr error?
    }

})();

function loadProfile(userProfile) {
    // riot
    document.getElementById("rank").innerText = userProfile.riot.rankedSolo5x5.tier + " " +
        userProfile.riot.rankedSolo5x5.rank;
    document.getElementById("lp").innerText = userProfile.riot.rankedSolo5x5.leaguePoints + " LP";
    document.getElementById("summoner-name").innerText = userProfile.riot.summonerName;
    document.getElementById("region").innerText = userProfile.riot.region.toUpperCase();
    document.getElementById("summoner-level").innerText = "Level " + userProfile.riot.summonerLevel;

    // profile
    document.getElementById("age").value = userProfile.profile.age;
    document.getElementById("languages").value = userProfile.profile.languages;
    document.getElementById("country").value = userProfile.profile.country;
    document.getElementById("roles").value = userProfile.profile.roles;
    document.getElementById("description").value = userProfile.profile.description;

    // summoner rank
    const summonerRank = document.getElementById("summoner-rank-icon");
    const summonerRankFromDB = userProfile.riot.rankedSolo5x5.tier.split(" ")[0];
    summonerRank.src = "/assets/riot/ranked-emblems/" + summonerRankFromDB + ".png";

    // summoner icon
    const summonerIcon = document.getElementById("summoner-icon");
    const summonerIconFromDB = userProfile.riot.profileIconId;
    summonerIcon.src = "http://ddragon.leagueoflegends.com/cdn/11.11.1/img/profileicon/" + summonerIconFromDB + ".png";

    // summoner stats
    const championStatsDiv = document.getElementById("champion-stats");
    userProfile.riot.seasonStats.forEach(champion => {

        // div
        const championDiv = document.createElement("div");
        championDiv.classList.add("row", "border", "my-3", "mx-1", "align-items-center");

        // div for champion icon
        const iconDiv = document.createElement("div");
        iconDiv.classList.add("col", "col-1", "py-3");

        // champion icon
        const championIcon = document.createElement("img")
        championIcon.classList.add("img-fluid", "w-100");
        championIcon.src = "http://ddragon.leagueoflegends.com/cdn/11.11.1/img/champion/" + champion.champion + ".png";

        iconDiv.appendChild(championIcon);
        championDiv.appendChild(iconDiv);

        // div for champion name
        const championNameDiv = document.createElement("div");
        championNameDiv.classList.add("col", "col-2", "py-3");

        // champion name
        const championName = document.createElement("h5");
        championName.innerText = champion.champion;

        championNameDiv.appendChild(championName);
        championDiv.appendChild(championNameDiv);

        // div for kda
        const kdaDiv = document.createElement("div");
        kdaDiv.classList.add("col", "col-2", "py-3");

        // kda
        const kda = document.createElement("h5");
        kda.innerText = "KDA: " + champion.KDA;

        kdaDiv.appendChild(kda);
        championDiv.appendChild(kdaDiv);

        // div for games played
        const gamesPlayedDiv = document.createElement("div");
        gamesPlayedDiv.classList.add("col", "col-3", "py-3");

        // kda
        const gamesPlayed = document.createElement("h5");
        gamesPlayed.innerText = "Games played: " + champion.gamesPlayed;

        gamesPlayedDiv.appendChild(gamesPlayed);
        championDiv.appendChild(gamesPlayedDiv);

        // div for winrate
        const winrateDiv = document.createElement("div");
        winrateDiv.classList.add("col", "col-3", "py-3");

        // kda
        const winrate = document.createElement("h5");
        winrate.innerText = "Winrate: " + champion.winRate;

        winrateDiv.appendChild(winrate);
        championDiv.appendChild(winrateDiv);

        championStatsDiv.appendChild(championDiv);
    });
}

function enableProfileEditing() {
    // set up save profile button
    const saveProfileButton = document.createElement("button");
    saveProfileButton.type = "submit";
    saveProfileButton.classList.add("btn", "btn-success", "w-25", "mt-3");
    saveProfileButton.innerText = "Save";

    const saveCol = document.getElementById("form-save-col");
    saveCol.appendChild(saveProfileButton);

    const profileForm = document.getElementById("profile-form");
    const formData = new FormData(profileForm);

    formData.forEach((value, key) => {
        document.getElementById(key).readOnly = false;
    })
}

async function isLoggedIn() {
    const response = await fetch("/auth/is-logged-in");

    return await response.json();
}

async function getUserProfile() {
    const splitUrl = location.pathname.split("/");

    const data = {
        summonerName: splitUrl[2],
        region: splitUrl[3]
    }

    const userUrl = "/api/users/" + data.summonerName + "/" + data.region;

    const response = await fetch(userUrl);

    return await response.json();
}

async function getUser() {
    const response = await fetch("/api/users/current");

    return await response.json();
}

async function sendFormData() {
    const profileForm = document.getElementById("profile-form");

    const formData = new FormData(profileForm);

    const data = {}

    formData.forEach((value, key) => data[key] = value);

    await fetch("/api/users/profile", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "PUT",
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
            }

            console.log("save was ok")

            toastr.success("Profile saved!");
        })
        .catch(err => {
            toastr.error("Something went wrong. Try again");
        })
}
