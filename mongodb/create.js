const db = require("./db");

function user(data) {
    db.query().collection("users").insertOne(
        data,
        (error, data) => {
            if (error) {
                throw new Error(error);
            }
            console.log(data);
        }
    );
}

module.exports = {
    user
}
