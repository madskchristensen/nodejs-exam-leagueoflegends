const mongo = require("../mongodb/mongodb");
const ObjectId = require('mongodb').ObjectId; 

async function saveMessage(data) {
    // find if conversation between users were had
    const conversation = await mongo.findChats.sharedBetweenIds( data.to._id, data.from._id);

    // if conversation exists ==> conversation was already had ==> append message to chat
    if (conversation) {
        // create message object
        const messageData = {
            from: ObjectId(data.from._id),
            body: data.message,
            timeStamp: new Date().toUTCString()
        };

        const result = await mongo.updateChats.messages(conversation._id, messageData);
       
        // if 1 chat was found, 1 chat was modified and result is ok, update was successful
        if (result.n === 1 && result.nModified === 1 && result.ok === 1) {
            return { data: true, method: "update" };

        } else {
            return { data: false, method: "update" };
        }
        
    // if no conversation exists ==> create new chat
    } else {
        // create new conversation
        const conversationData = {
            participants: [ 
                {
                    userObjectId: ObjectId(data.to._id)
                },
                {   
                    userObjectId: ObjectId(data.from._id)
                }
            ],
            messages: [ 
                {
                    from: ObjectId(data.from._id),
                    body: data.message,
                    timeStamp: new Date().toUTCString()
                }
            ]
        };
        mongo.insertChats.chat(conversationData);
        return { data: true, method: "create" };
    }    
}

// combines all chat participants in array of chats into a single array
async function combineAllChatParticipants(chats, user) {
    // combine all messagepartners
    let conversationPartners = [user];
    for (let conversation of chats) {
        try {
            // filter own id 
            const conversationPartnerId = conversation.participants.find( ({ userObjectId }) => userObjectId.toString() !== user._id.toString() );
            let conversationParticipant = await mongo.findUsers.byId(conversationPartnerId.userObjectId);
            if (conversationParticipant) {
                delete conversationParticipant.details;
                delete conversationParticipant.profile;
    
                conversationPartners.push(conversationParticipant);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return conversationPartners;
}

module.exports = {
    saveMessage,
    combineAllChatParticipants
};