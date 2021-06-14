const chatService = require("./service/chats");
const escapeHTML = require("html-escaper").escape;

const rootSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("A socket connected with id" + socket.id);
    
        // create username from session
        socket.data.summonerName = socket.request.session.user.riot.summonerName;
        socket.data.region = socket.request.session.user.riot.region;
    
        socket.data.username = socket.data.summonerName + "-" + socket.data.region;
        
        // get user from session
        const userFromSession = socket.request.session.user;
    
        // join room with username
        socket.join(socket.data.username);
    
        // triggered when a new message is sent
        socket.on("private message", async (data) => {
            // send message to other user
            data.from = userFromSession;
    
            // attempt to save message to existing chat or create new if one doesn't exist between participants (from/receiver)
            const response = await chatService.saveMessage(data);
    
            if (response.data) {
                socket.to(data.to.riot.summonerName + "-" + data.to.riot.region).emit("private message", {
                    message: escapeHTML(data.message),
                    from: socket.request.session.user,
                    to: data.to,
                    toSelf: false
                });
    
                // emits the message/data to sender
                io.in(socket.data.username).emit("private message", {
                    message: escapeHTML(data.message),
                    from: data.to,
                    to: socket.request.session.user,
                    toSelf: true
                });
            } 
        });
    
        socket.on("disconnect", async () => {
            console.log("A socket disconnected:", socket.data.username);
        })
    });    
}

module.exports = rootSocket;
