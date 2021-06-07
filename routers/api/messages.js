const router = require("express").Router();
const mongo = require("../../mongodb/mongodb");

router.get("/api/messages", async (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        // get ID for user from DB
        const user = req.session.user;
        const region = user.riot.region;
        const summonerName = user.riot.summonerName;
    
        const userFromDB = await mongo.find.byRegionAndSummoner(region, summonerName);
        delete userFromDB.details;
        delete userFromDB.profile;
        
        // get messages for given user
        const conversation = {};
        const chatsFromDB = await mongo.findChats.findAll(userFromDB._id);
        console.log(chatsFromDB);
        // check if conversations were had
        if (chatsFromDB.length) {
            // combine all messagepartners
            let conversationPartners = [userFromDB];
            for (let conversation of chatsFromDB) {
                try {
                    // filter own id 
                    const conversationPartnerId = conversation.participants.find( ({ userObjectId }) => userObjectId.toString() !== userFromDB._id.toString() );
                    let conversationParticipant = await mongo.find.byId(conversationPartnerId.userObjectId);

                    delete conversationParticipant.details;
                    delete conversationParticipant.profile;
                    conversationParticipant._id = conversationParticipant._id;
                    conversationPartners.push(conversationParticipant);
                }
                catch (error) {
                    console.log(error);
                }
            }
            // delete ids
            delete chatsFromDB[0]._id;
            delete chatsFromDB._id;

            conversation.chats = chatsFromDB;
            conversation.participants = conversationPartners;
            conversation.userID = userFromDB._id.toString();
        }

        res.send(conversation);

    } else {
        res.sendStatus(401);
    }
});

module.exports = {
    router
}