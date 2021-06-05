const db = require("./db");
const ObjectId = require('mongodb').ObjectId; 

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

// find conversation between two Ids
async function conversationByIds (objectId1, objectId1) {
    const filter = { "$and": [ { "participants.userObjectId" : objectId1 }, { "participants.userObjectId" : objectId2 } ] };

    return await db.query().collection("chats").find(filter).
        then(conversation => conversation)
        .catch(err => err);
}

// get find conversations that Id is part of
async function conversationsBySingleId (objectId) {
    const filter = { "participants.userObjectId": objectId };

    return await db.query().collection("chats").find(filter).toArray()
    .then(conversations => conversations)
    .catch(err => err)
}

async function byId(objectId) {
    return await db.query().collection("users").findOne(ObjectId(objectId))
        .then(user => user)
        .catch(err => err);
}


module.exports = {
    byEmail,
    byRegionAndSummoner,
    conversationByIds,
    conversationsBySingleId,
    byId
}
