const db = require("../db");

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
    chat
}