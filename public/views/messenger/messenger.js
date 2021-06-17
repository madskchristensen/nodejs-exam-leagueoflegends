import { getChatParticipants, getChats, getLoggedInUser } from "/js/api.js";

(async function getMessages() {
    try {
        // get chats from DB according to logged in user
        const chats = await getChats();

        // check if user has any chats
        if (chats) {
            // set participants of said chats
            const participants = await getChatParticipants();
            
            // get logged in user from session
            const loggedInUser = await getLoggedInUser();

            // div containing chats
            const chatsDiv = document.getElementById("chats");

            // div containing the messages shown for selected chat
            const messengerDiv = document.getElementById("messenger");

            // go through each chat and generate html elements accordingly
            chats.forEach(chat => {
                console.log("chat", chat);

                // get chat partner data, containing id, summonerName etc.
                const chatPartner = findChatPartner(chat, loggedInUser._id, participants);

                console.log("chat partner:", chatPartner);

                // get last messageObject that sent message
                const lastMessage = chat.messages[chat.messages.length - 1];

                // find user that sent last message
                let lastUser;
                participants.forEach(user => {
                    if (user._id === lastMessage.from) {
                        lastUser = user;
                    }
                });

                // create left side chat entry (list-group-item)
                generateChat(chatPartner, lastUser.riot.summonerName, lastMessage, chatsDiv);

                // Creates the message container/div containing all the messages for a chat
                const messagesContainer = generateMessagesContainer(chatPartner.riot.summonerName, chatPartner.riot.region);
                
                // loop through messages in chat and append them to list
                chat.messages.forEach(message => {
                    if (message.from === chatPartner._id) {
                        generateMessage(message.body, chatPartner, loggedInUser, messagesContainer)

                    } else if (message.from === loggedInUser._id) {
                        generateMessage(message.body, loggedInUser, loggedInUser, messagesContainer)
                    }
                });

                // Append the message container to the wrapping messengerDiv
                messengerDiv.appendChild(messagesContainer);
            })
        }
    }

    catch(error) {
        console.log(error);
    }

})(); 

function findChatPartner(chat, loggedInUserId, participants) {
    // go through the participants of a single chat and find the user that isn't currently logged in user
    const chatPartnerId = chat.participants.find( ({ userObjectId }) => userObjectId.toString() !== loggedInUserId );

    console.log("in findChatPartner: ", chatPartnerId);

    // get chat partner object from id containing the user data like summonerName etc.
    const chatPartner = participants.find( ({ _id }) => _id.toString() === chatPartnerId.userObjectId.toString() );

    return chatPartner;
}

// create left side chat element
function generateChat(chatPartner, lastUserSummonerName, lastMessage, divToAppendTo) {
    // summoner name
    const chatPartnerSummonerName = chatPartner.riot.summonerName;

    // region
    const chatPartnerRegion = chatPartner.riot.region;
    // outside link
    const link = document.createElement("a");
    link.classList.add("list-group-item", "list-group-item-action", "chat-link", "chat-container");
    link.setAttribute("data-bs-toggle", "list");
    link.setAttribute("role", "tab");

    // wrapper div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("row");

    // div for summoner icon
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("col", "col-4", "py-3");
    
    // add id to user link
    link.href="#list-" + chatPartnerSummonerName + "-" + chatPartnerRegion;
    link.setAttribute("aria-controls", chatPartnerSummonerName + "-" + chatPartnerRegion);
    link.id = chatPartnerSummonerName + "-" + chatPartnerRegion;

    // summoner icon
    // display icon of chat partner
    const summonerIcon = document.createElement("img");
    summonerIcon.classList.add("img", "w-100");   
    summonerIcon.src = "http://ddragon.leagueoflegends.com/cdn/11.11.1/img/profileicon/" + chatPartner.riot.profileIconId + ".png";

    // append summoner icon to div
    iconDiv.appendChild(summonerIcon);
    chatDiv.appendChild(iconDiv);

    // wrapper div for name and message
    const textDiv = document.createElement("div");
    textDiv.classList.add("col", "col-8");

    // div for summoner name
    const nameDiv = document.createElement("div");
    nameDiv.classList.add("row", "row-12");
    
    // summoner name
    const summonerName = document.createElement("h5");
    summonerName.classList.add("pt-3");
    summonerName.id = "summonerName-" + chatPartnerSummonerName + "-" + chatPartnerRegion;
    summonerName.innerText = chatPartnerSummonerName;

    // append summoner name to div
    nameDiv.appendChild(summonerName);
    textDiv.appendChild(nameDiv);
    
    // div for region
    const regionDiv = document.createElement("div");
    regionDiv.classList.add("row", "row-12");

    // region
    const region = document.createElement("p");
    region.id = "region-" + chatPartnerSummonerName + "-" + chatPartnerRegion;
    region.innerText = chatPartner.riot.region;

    // append region to div
    regionDiv.appendChild(region);
    textDiv.appendChild(regionDiv);

    // last message text
    const lastMessagePreviewDiv = document.createElement("div");
    lastMessagePreviewDiv.classList.add("row", "row-12"); 

    // last message
    const lastMessagePreview = document.createElement("p");
    lastMessagePreview.classList.add("fw-light");

    // Append You / summoner name dependant on who sent the last message
    if (lastMessage.from !== chatPartner._id) {
        lastMessagePreview.innerText = "You: " + lastMessage.body;

    } else {
        lastMessagePreview.innerText = lastUserSummonerName + ": " + lastMessage.body;
    }

    // apppend last message to div
    lastMessagePreviewDiv.appendChild(lastMessagePreview);
    textDiv.appendChild(lastMessagePreviewDiv);
    chatDiv.appendChild(textDiv);

    // append chat to div
    link.appendChild(chatDiv);
    divToAppendTo.appendChild(link);
}

function generateMessagesContainer(chatPartnerSummonerName, chatPartnerRegion) {
    const chatPartnerUsername = chatPartnerSummonerName + "-" + chatPartnerRegion;

    const messagesContainer = document.createElement("div");
    messagesContainer.classList.add("tab-pane", "fade", "row");
    messagesContainer.setAttribute("role", "tabpanel");
    messagesContainer.setAttribute("aria-labelledby", chatPartnerUsername);
    messagesContainer.id = "list-" + chatPartnerUsername;

    return messagesContainer;
}

// Generates a message container. Aligns left/right dependant sender and session info
function generateMessage(message, from, loggedInUser, divToAppendTo) {
    console.log("(js) from:", from)
    console.log("(js) loggedInUser:", loggedInUser)

    const wrapperMessageDiv = document.createElement("div");
    wrapperMessageDiv.classList.add("row");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("col", "col-4", "my-1", "rounded-start");

    const messageText = document.createElement("p");
    messageText.classList.add("message-text");
    messageText.innerText = from.riot.summonerName + ": " + message;
    
    // display messages left/right dependent on sender
    if (from._id === loggedInUser._id) {
        wrapperMessageDiv.classList.add("justify-content-end");
        messageDiv.classList.add("message-right", "d-flex", "justify-content-end", "align-items-center");

    } else {
        messageDiv.classList.add("message-left", "d-flex", "justify-content-start");
    }

    messageDiv.appendChild(messageText);
    wrapperMessageDiv.appendChild(messageDiv);
    divToAppendTo.appendChild(wrapperMessageDiv);
}

function resetMessageInputs() {
    document.getElementById("new-chat-input").value = "";
    document.getElementById("message-input").value = "";
}

export {
    generateChat,
    generateMessagesContainer,
    generateMessage,
    resetMessageInputs
}

