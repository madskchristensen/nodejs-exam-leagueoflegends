const db = require("./db");

async function byEmail(email) {
    const filter = { "details.email": email };

    return await db.query().collection("users").findOne(filter)
        .then(user => user)
        .catch(err => err);
}

async function byRegionAndSummoner(region, summonerName) {
    const filter = { "$and": [ { "riot.summonerName" : summonerName }, { "riot.region" : region } ] };

    return await db.query().collection("users").findOne(filter)
        .then(user => user)
        .catch(err => err);
}

module.exports = {
    byEmail,
    byRegionAndSummoner
}
