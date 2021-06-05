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
    console.log(data);

    // get objectIds for sender/receiver

    //check if conversation exists between participants
    
    return "hey"; 
}

module.exports = {
    saveMessages
}