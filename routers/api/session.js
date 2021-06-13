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

// TO BE REMOVED. HERE FOR REFERENCING PURPOSES AFTER REVIEW
/*
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
        
        // get chats for given user
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
            res.status(204).send( { message: "No chats found" } );
        }
        
    } else {
        res.status(401).send( { error: "You are not authorized to access this endpoint" } );
    }
});*/

// returns chats that user from session is part of
router.get("/api/session/chats/conversations", async (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        // get ID for user from DB
        const loggedInUserId = req.session.user._id;
        
        // get chats for given user
        const chatsFromDB = await mongo.findChats.findAll(loggedInUserId);

        // check if conversations were had
        if (chatsFromDB.length) {
            res.status(200).send(chatsFromDB);

        } else {
            // no chats found send null object
            res.status(204).send( { message: "No chats found" } );
        }
        
    } else {
        res.status(401).send( { error: "You are not authorized to access this endpoint" } );
    }
});

// returns the participants (user objects) of the chats that user from session is part of
router.get("/api/session/chats/participants", async (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        // get ID for user from DB
        const loggedInUserId = req.session.user._id;
        
        // get chats for given user
        const chatsFromDB = await mongo.findChats.findAll(loggedInUserId);

        // check if conversations were had
        if (chatsFromDB.length) {
            // combine all messagepartners
            const conversationPartners = await messageService.combineAllChatParticipants(chatsFromDB, req.session.user);
            res.status(200).send(conversationPartners);

        } else {
            // no chats found send null object
            res.status(204).send( { message: "No chats or conversation partners found found" } );
        }
        
    } else {
        res.status(401).send( { error: "You are not authorized to access this endpoint" } );
    }
});
module.exports = {
    router
}