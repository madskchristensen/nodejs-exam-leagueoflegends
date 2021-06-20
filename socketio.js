const chatService = require("./service/chats");
const escapeHTML = require("html-escaper").escape;

const rootSocket = (io) => {
    io.on("connection", (socket) => {

        // get user from session
        const userFromSession = socket.request.session.user;

        // create username from session
        socket.data.summonerName = userFromSession.riot.summonerName;
        socket.data.region = userFromSession.riot.region;

        socket.data.username = socket.data.summonerName + "-" + socket.data.region;

        console.log("Socket connected:", socket.data.username);
    
        // join room with username
        socket.join(socket.data.username);
    
        // triggered when a new message is sent in front-end
        socket.on("private message", async (data) => {
            // send message to other user
            data.from = userFromSession;
    
            // attempt to save message to existing chat or create new if one doesn't exist between participants (from/receiver)
            const response = await chatService.saveMessage(data);

            // if saveMessage operation went ok
            if (response.data) {
                // emit message to receiver
                io.in(data.to.riot.summonerName + "-" + data.to.riot.region).emit("private message", {
                    message: escapeHTML(data.message),
                    from: userFromSession,
                    to: data.to,
                    toSelf: false
                });
    
                // emit message to sender
                io.in(socket.data.username).emit("private message", {
                    message: escapeHTML(data.message),
                    from: socket.request.session.user,
                    to: data.to,
                    toSelf: true
                });
            } 
        });
    
        socket.on("disconnect", async () => {
            console.log("Socket disconnected:", socket.data.username);
        })
    });    
}

module.exports = {
    rootSocket
};
