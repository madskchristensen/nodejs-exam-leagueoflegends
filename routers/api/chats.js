const router = require("express").Router();
const mongo = require("../../mongodb/mongodb");
const messageService = require("../../service/chats");

// GET all conversations that logged in user is part of. Data is split up into two sections: 
// CHATS: All conversations that logged in user is part of
// PARTICIPANTS: Array of all participants in all conversations
router.get("/api/chats/current", async (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        // get ID for user from DB
        const user = req.session.user;
        const region = user.riot.region;
        const summonerName = user.riot.summonerName;
    
        const userFromDB = await mongo.findUsers.byRegionAndSummoner(region, summonerName);
        delete userFromDB.details;
        delete userFromDB.profile;
        
        // get messages for given user
        const conversation = {};
        const chatsFromDB = await mongo.findChats.findAll(userFromDB._id);

        // check if conversations were had
        if (chatsFromDB.length) {
            // combine all messagepartners
            const conversationPartners = await messageService.combineAllChatParticipants(chatsFromDB, userFromDB);
            
            // delete ids
            delete chatsFromDB[0]._id;
            delete chatsFromDB._id;
            
            conversation.chats = chatsFromDB;
            conversation.participants = conversationPartners;
            conversation.userID = userFromDB._id.toString();

            res.status(200).send(conversation);
        } else {
            // no chats found send null object
            res.status(204).send( { message: "No conversations found" } );
        }
    } else {
        res.status(401).send( { error: "You are not authorized to access this endpoint" } );
    }
});

module.exports = {
    router
};