const db = require("../db");

function user(data) {
    db.query().collection("users").insertOne(
        data,
        (error, data) => {
            if (error) {
                throw new Error(error);
            }
        }
    );
}

function profile(data) {
    db.query().collection("users").insertOne(
        data,
    )
}

module.exports = {
    user,
    profile
}
