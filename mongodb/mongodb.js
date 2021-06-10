// This module gathers all mongodb modules that are intended to be called and used in endpoints, services etc.

const findUsers = require("./users/findUsers");
const insertUsers = require("./users/insertUsers");
const updateUsers = require("./users/updateUsers");

const findChats = require("./chats/findChats");
const insertChats = require("./chats/insertChats");
const updateChats = require("./chats/updateChats")

module.exports = {
    findUsers,
    insertUsers,
    updateUsers,
    findChats,
    insertChats,
    updateChats
};
