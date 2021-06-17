require("dotenv").config();

// https://mrvautin.com/re-use-mongodb-database-connection-in-routes/

/* --- Example of how to use ---
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

// variables to be used
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://" + process.env.db_host + ":" + process.env.DB_PORT;
const dbName = process.env.DB_NAME;
let mongodb;

// wraps the server.listen call in app.js
// this makes it so the connection can be re-used through the application
// and helps by not having to call mongoClient.connect... every time a db operation needs to be performed
function connect(callback) {
    mongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        mongodb = client.db(dbName);
        callback();
    });
}

// utility function to call when doing operations
// eg. db.query().collection('users').find({}).toArray()
function query() {
    return mongodb;
}

// utility function to close connection
// not really sure if needed but keeping it for now
function close() {
    mongodb.close();
}

module.exports = {
    connect,
    query,
    close
};
