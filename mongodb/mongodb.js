// This module gathers all mongodb modules that are intended to be called and used in endpoints, services etc.

const findUsers = require("./users/findUsers");
const insertUsers = require("./users/insertUsers");

module.exports = {
    findUsers,
    insertUsers
}
