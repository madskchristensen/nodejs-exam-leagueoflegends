const db = require("./db");

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

function chat(data) {
    db.query().collection("chats").insertOne(
        data,
        (error, data) => {
            if (error) {
                throw new Error(error);
            }
        }
    );
}

module.exports = {
    user
}
