require("dotenv").config();

// https://mrvautin.com/re-use-mongodb-database-connection-in-routes/
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT;
const dbName = process.env.DB_NAME;
let mongodb;

function connect(callback) {
    mongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        mongodb = client.db(dbName);
        callback();
    });
}

function query() {
    return mongodb;
}

function close() {
    mongodb.close();
}

/* --- Eksempel på brug ---
const db = require("./mongodb/db");

db.query().collection("profiles").insertOne(
    { name: "test", rank: "silver1" },
    (error, data) => {
        if (error) {
            throw new Error(error);
        }
        console.log(data);
    }
);
*/

module.exports = {
    connect,
    query,
    close
};
