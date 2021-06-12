const db = require("../db");
const ObjectId = require('mongodb').ObjectId; 

// find conversation between two Ids
function sharedBetweenIds (objectId1, objectId2) {
    const filter = { "participants.userObjectId" : { $all: [ObjectId(objectId1), ObjectId(objectId2) ] } };

    return db.query().collection("chats").findOne(filter)
        .then(conversation => conversation)
        .catch(err => err);
}

// get find conversations that Id is part of
function findAll (objectId) {
    const filter = { "participants.userObjectId": objectId };

    return db.query().collection("chats").find(filter).toArray()
    .then(conversations => conversations)
    .catch(err => err);
}

function byId(objectId) {
    return db.query().collection("chats").findOne(ObjectId(objectId))
        .then(conversation => conversation)
        .catch(err => err);
}

module.exports = {
    sharedBetweenIds,
    findAll,
    byId
};