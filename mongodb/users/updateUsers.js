const db = require("../db");

function profile(summonerName, region, data) {
    const regex = new RegExp(`(${summonerName})`, "gi");

    const filter = { "$and": [ { "riot.summonerName" : regex }, { "riot.region" : region } ] };
    const update = { $set: { profile : data } };

    return db.query().collection("users").updateOne(filter, update)
        .then(res => res.result)
        .catch(err => err);
}

module.exports = {
    profile
}
