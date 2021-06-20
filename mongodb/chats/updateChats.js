const db = require("../db");

function messages(chatId, messageData) {
    const filter = { _id: chatId };
    const update = { $push: { messages: messageData } };
    
    return db.query().collection("chats").updateOne(filter, update)
        .then(res => res.result)
        .catch(err =>  err);
}

module.exports = {
    messages
};
