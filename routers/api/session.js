const router = require("express").Router();
const mongo = require("../../mongodb/mongodb");
const messageService = require("../../service/chats");

router.get("/api/session/logged-in", (req, res) => {
    const loggedIn = req.session.loggedIn;

    res.send( { data: loggedIn } );
});

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
router.get("/api/session", (req, res) => {
    if (process.env.NODE_ENV === "development") {
        res.send( { session: req.session } );

    } else {
        res.sendStatus(403);
    }
});

// returns chats that user from session is part of
router.get("/api/session/chats", async (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        // get ID for user from DB
        const loggedInUserId = req.session.user._id;
        
        // get chats for given user
        const chatsFromDB = await mongo.findChats.findAll(loggedInUserId);

        // check if conversations were had
        if (chatsFromDB.length) {
            res.status(200).send({ error: "", chats: chatsFromDB });

        } else {
            // no chats found send null object
            res.status(204).send( { error: "" } );
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
            // no chats found send error
            res.status(204).send( { message: "No chats or conversation partners found" } );
        }
        
    } else {
        res.status(401).send( { error: "You are not authorized to access this endpoint" } );
    }
});

module.exports = {
    router
}
