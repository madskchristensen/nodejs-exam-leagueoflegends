const db = require("../db");

async function byEmail(email) {
    const filter = { "details.email": email };

    return await db.query().collection("users").findOne(filter)
        .then(user => user)
        .catch(err => err);
}

async function byRegionAndSummoner(region, summonerName) {
    // using constructor for regex instead of literal as constructor allows runtime compilation.
    // this is needed because summonerName might be different from call to call
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    const regex = new RegExp(`(${summonerName})`, "gi");

    const filter = { "$and": [ { "riot.summonerName" : regex }, { "riot.region" : region } ] };

    return await db.query().collection("users").findOne(filter)
        .then(user => user)
        .catch(err => err);
}

async function all() {
    const filter = {};

    return await db.query().collection("users").find(filter).toArray()
        .then(users => users)
        .catch(err => err);
}

module.exports = {
    byEmail,
    byRegionAndSummoner,
    all
}
