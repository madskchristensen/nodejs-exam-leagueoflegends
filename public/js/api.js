async function isLoggedIn() {
    const response = await fetch("/api/session/logged-in");

    return response.json().then(res => res.data);
}

async function getLoggedInUser() {
    const response = await fetch("/api/session/user");

    return response.json();
}

async function getUser(summonerName, region) {
    const userUrl = "/api/users/" + summonerName + "/" + region;

    const response = await fetch(userUrl);

    return response.json();
}

async function getUserFromUrl() {
    const splitUrl = location.pathname.split("/");

    const data = {
        summonerName: splitUrl[2],
        region: splitUrl[3]
    };

    const userUrl = "/api/users/" + data.summonerName + "/" + data.region;

    const response = await fetch(userUrl);

    return response.json();
}

async function getChats() {
    const response = await fetch("/api/session/chats");

    return response.json().then(res => res.chats);
}

async function getChatParticipants() {
    const response = await fetch("/api/session/chats/participants");

    return response.json();
}

export {
    getLoggedInUser,
    getUser,
    getUserFromUrl,
    getChats,
    getChatParticipants,
    isLoggedIn
}
