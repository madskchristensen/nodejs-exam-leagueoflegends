const mongo = require("../mongodb/mongodb");

// Post message to conversation 
/*
router.post ("/api/messages/create-message", (req, res) => {
    // if no conversation including the two participants create new conversation with participants object and messages object (1)
    // else append message object to existing messages object
    console.log(req.body);
    // create message object to be saved from localdatetime
    const successfull = true;
    // find conversation between users (receiver and socketIdentifier)
    if (successfull) {
        res.sendStatus(201).send({ message:"Message was saved successfully" });
    }
    else {
        res.sendStatus(500).send({ message: "Message could not be saved in database" });
    }
});*/

async function saveMessages(data) {
    // get objectIds for sender/receiver
    const receiverUsername = data.receiver.summonerName;
    const receiverRegion = data.receiver.region;
    const receiverFromDB = await mongo.find.byRegionAndSummoner(receiverRegion, receiverUsername);

    const senderUsername = data.from.summonerName;
    const senderRegion = data.from.region;
    const senderFromDB = await mongo.find.byRegionAndSummoner(senderRegion, senderUsername);

    // find conversation between users
    const conversation = await mongo.findChats.sharedBetweenIds( receiverFromDB._id, senderFromDB._id);
    if (conversation) {
        // append message to conversation
        // create message object
        const messageData = {
            from: senderFromDB._id,
            body: data.message,
            timeStamp: new Date().toUTCString()
        }
        mongo.updateChats.messages(conversation._id, messageData)
    }
    else {
        // create new conversation
        const conversationData = {
            participants: [ 
                {
                    userObjectId: receiverFromDB._id
                },
                {   
                    userObjectId: senderFromDB._id
                } 
            ],
            messages: [ 
                {
                    from: senderFromDB._id,
                    body: data.message,
                    timeStamp: new Date().toUTCString()
                }
            ]
        }
        mongo.insertChats.chat(conversationData);
    }    
    return "hey"; 
}

module.exports = {
    saveMessages
}