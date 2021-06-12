const router = require("express").Router();
const mongo = require("../../mongodb/mongodb");
const messageService = require("../../service/chats");

// returns logged in user in session
router.get("/api/session/user", (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        const user = req.session.user;
        delete user.details;

        res.status(200).send(user);

    } else {
        res.status(404).send( { error: "Logged in user not found" } );
    }
});

// returns session element if NODE_ENV is set to development
router.get("api/session", (req, res) => {
    if (process.env.NODE_ENV === "development") {
        res.send( { session: req.session } );

    } else {
        res.sendStatus(403);
    }
});

router.get("/api/session/chats", async (req, res) => {
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
}