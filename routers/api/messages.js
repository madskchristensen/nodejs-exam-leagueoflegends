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
        const messages = await mongo.find.conversationsBySingleId(userFromDB._id.toString());

        // combine all messagepartners
        let conversationPartners = [userFromDB];
        for (let conversation of messages) {
            try {
                // filter own id 
                const conversationPartnerId = conversation.participants.find( ({ userObjectId }) => userObjectId !== userFromDB._id.toString() );
                let conversationParticipant = await mongo.find.byId(conversationPartnerId.userObjectId.toString());
                delete conversationParticipant.details;
                delete conversationParticipant.profile;

                conversationPartners.push(conversationParticipant);
            }
            catch (error) {
                console.log(error);
            }
        }
        messages.push(conversationPartners);
        messages.push(userFromDB._id.toString());

        // delete ids
        delete messages[0]._id;
        delete messages._id;

        res.send(messages);

    } else {
        res.sendStatus(401);
    }
});

module.exports = {
    router
}