const db = require("../db");
const ObjectId = require('mongodb').ObjectId; 

function byEmail(email) {
    const filter = { "details.email": email };

    return db.query().collection("users").findOne(filter)
        .then(res => res);
}

function byRegionAndSummoner(region, summonerName) {
    // using constructor for regex instead of literal as constructor allows runtime compilation.
    // this is needed because summonerName might be different from call to call
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    const regex = new RegExp(`(${summonerName})`, "gi");

    const filter = { "$and": [ { "riot.summonerName" : regex }, { "riot.region" : region } ] };

    return db.query().collection("users").findOne(filter)
        .then(res => res);
}


async function byId(objectId) {
    return await db.query().collection("users").findOne(ObjectId(objectId))
        .then(user => user)
        .catch(err => err);
}

function all() {
    return db.query().collection("users").find().toArray()
        .then(res => res);
}

module.exports = {
    byEmail,
    byRegionAndSummoner,
    byId,
    all
};
