const db = require("../db");

function messages(chatId, data) {
    const filter = { _id: chatId };
    const update = { $push: { messages: data } };
    
    return db.query().collection("chats").updateOne(filter, update)
        .then(res => res.result)
        .catch(err =>  err);
}

module.exports = {
    messages
};
