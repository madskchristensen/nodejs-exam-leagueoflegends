(async function getProfile() {
    try {
        const loggedIn = await isLoggedIn();

        // TO DO - get summoner name from query param
        // something something get summoner
        // test user for now
        const testSummoner = {
            custom: {
                age: "25",
                languages: "Danish, English",
                country: "Denmark",
                roles: "Mid, Jungle",
                description: "i am a league gamer"
            },
            riot: {
                summonerName: "Jens",
                summonerIcon: "4301",
                summonerPicture: "picture8413",
                summonerLevel: "65",
                rank: "Silver V 85LP",
                previousSeasons: [
                    {
                        season: "8",
                        rank: "Silver"
                    },
                    {
                        season: "9",
                        rank: "Gold"
                    }
                ],
                seasonStats: [
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
                ]
            },
            details: {
                email: "jens@gmail.com",
                password: "hashedpasword873131"
            }
        }

        const user = await getUser();

        const buttonWrapper = document.getElementById("button-wrapper");

        // create message button if logged in
        if (loggedIn) {
            const messageLink = document.createElement("a");
            messageLink.href = "/messenger";
            messageLink.classList.add("btn", "btn-lg", "mb-3", "btn-success")
            messageLink.innerText = "Message";

            buttonWrapper.appendChild(messageLink);
        }
        // disabled button if not logged in
        else if (!loggedIn) {
            const messageButton = document.createElement("button");
            messageButton.disabled = true;
            messageButton.type = "button";
            messageButton.innerText = "Please login to message";
            messageButton.classList.add("btn", "btn-secondary", "w-75")

            buttonWrapper.appendChild(messageButton);
        }

        // fill in summoner info
        // service
        document.getElementById("rank").innerText = user.riot.rankedSolo5x5.tier + " " +
            user.riot.rankedSolo5x5.rank;
        document.getElementById("lp").innerText = user.riot.rankedSolo5x5.leaguePoints + " LP";
        document.getElementById("summoner-name").innerText = user.riot.summonerName;
        document.getElementById("region").innerText = user.riot.region.toUpperCase();
        document.getElementById("summoner-level").innerText = "Level " + user.riot.summonerLevel;

        // profile
        document.getElementById("age").value = testSummoner.custom.age;
        document.getElementById("languages").value = testSummoner.custom.languages;
        document.getElementById("country").value = testSummoner.custom.country;
        document.getElementById("roles").value = testSummoner.custom.roles;
        document.getElementById("description").value = testSummoner.custom.description;

        // summoner rank
        const summonerRank = document.getElementById("summoner-rank-icon");
        const summonerRankFromDB = user.riot.rankedSolo5x5.tier.split(" ")[0];
        summonerRank.src = "/assets/service/ranked-emblems/" + summonerRankFromDB + ".png";

        // summoner icon
        const summonerIcon = document.getElementById("summoner-icon");
        const summonerIconFromDB = user.riot.profileIconId;
        summonerIcon.src = "http://ddragon.leagueoflegends.com/cdn/11.11.1/img/profileicon/" + summonerIconFromDB + ".png";

        // summoner stats
        const championStatsDiv = document.getElementById("champion-stats");
        testSummoner.riot.seasonStats.forEach(champion => {

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
        })
    } catch (error) {
        console.log(error);
    }
})();

async function isLoggedIn() {
    const response = await fetch("/auth/is-logged-in");

    return await response.json();
}

async function getUser() {
    const response = await fetch("/api/user");

    return await response.json();
}


