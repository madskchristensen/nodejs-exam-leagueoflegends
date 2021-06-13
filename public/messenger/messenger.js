(async function getMessages() {
    try {
        // get conversations from DB according to logged in user
        const conversationsFromDb = await getMessagesFromDB();

        const chats = conversationsFromDb.chats;

        // check if user has any chats
        if (chats) {
            // set participants of said chats
            const participants = conversationsFromDb.participants;

            // set user ID
            const loggedInUserId = conversationsFromDb.userID.toString();

            // div containing conversations
            const conversationsDiv = document.getElementById("conversations-div");

            // div containing the messages shown for selected conversation
            const messengerDiv = document.getElementById("messenger-div");

            // go through each conversation and generate html elements accordingly 
            chats.forEach(conversation => {

                // get conversation partner data, containing id, summonerName etc.
                const conversationPartner = findConversationPartner(conversation, loggedInUserId, participants);

                // get last messageObject that sent message
                const lastMessage = conversation.messages[conversation.messages.length - 1];

                // find user that sent last message
                let lastUser;
                participants.forEach(user => {
                    if (user._id === lastMessage.from) {
                        lastUser = user;
                    }
                });

                // create left side conversation entry (list-group-item)
                generateConversation(conversationPartner, lastUser.riot.summonerName, lastMessage, conversationsDiv);

                // Creates the message container/div containing all the messages for a chat
                const messageContainer = generateMessengerContainer(conversationPartner.riot.summonerName, conversationPartner.riot.region);
                
                // loop through messages in conversation and append them to list
                conversation.messages.forEach(message => {
                    generateMessage(message.body, message.from, loggedInUserId, messageContainer)
                });

                // Append the message container to the wrapping messengerDiv
                messengerDiv.appendChild(messageContainer);
            })
        }
    }

    catch(error) {
        console.log(error);
    }

})(); 

// creates a 
function findConversationPartner(conversation, loggedInUserId, participants) {
    // go through the participants of a single chat and find the user that isn't currently logged in user
    const conversationPartnerId = conversation.participants.find( ({ userObjectId }) => userObjectId.toString() !== loggedInUserId );

    // get conversation partner object from id containing the user data like summonerName etc.
    const conversationPartner = participants.find( ({ _id }) => _id.toString() === conversationPartnerId.userObjectId.toString() );

    return conversationPartner;
}

// create left side conversation element
function generateConversation (conversationPartner, lastUserSummonerName, lastMessage, divToAppendTo) {
    // summoner name
    const conversationPartnerSummonerName = conversationPartner.riot.summonerName;

    // region
    const conversationPartnerRegion = conversationPartner.riot.region;
    // outside link
    const link = document.createElement("a");
    link.classList.add("list-group-item", "list-group-item-action", "conversation-link", "conversation-container");
    link.setAttribute("data-bs-toggle", "list");
    link.setAttribute("role", "tab");

    // wrapper div
    const conversationDiv = document.createElement("div");
    conversationDiv.classList.add("row");

    // div for summoner icon
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("col", "col-4", "py-3");
    
    // add id to user link
    link.href="#list-" + conversationPartnerSummonerName + "-" + conversationPartnerRegion;
    link.setAttribute("aria-controls", conversationPartnerSummonerName + "-" + conversationPartnerRegion);
    link.id = conversationPartnerSummonerName + "-" + conversationPartnerRegion;

    // summoner icon
    // display icon of conversation partner
    const summonerIcon = document.createElement("img");
    summonerIcon.classList.add("img", "w-100");   
    summonerIcon.src = "http://ddragon.leagueoflegends.com/cdn/11.11.1/img/profileicon/" + conversationPartner.riot.profileIconId + ".png";

    // append summoner icon to div
    iconDiv.appendChild(summonerIcon);
    conversationDiv.appendChild(iconDiv);

    // wrapper div for name and message
    const textDiv = document.createElement("div");
    textDiv.classList.add("col", "col-8");

    // div for summoner name
    const nameDiv = document.createElement("div");
    nameDiv.classList.add("row", "row-12");
    
    // summoner name
    const summonerName = document.createElement("h5");
    summonerName.classList.add("pt-3");
    summonerName.id = "summonerName-" + conversationPartnerSummonerName + "-" + conversationPartnerRegion;
    summonerName.innerText = conversationPartnerSummonerName;

    // append summoner name to div
    nameDiv.appendChild(summonerName);
    textDiv.appendChild(nameDiv);
    
    // div for region
    const regionDiv = document.createElement("div");
    regionDiv.classList.add("row", "row-12");

    // region
    const region = document.createElement("p");
    region.id = "region-" + conversationPartnerSummonerName + "-" + conversationPartnerRegion;
    region.innerText = conversationPartner.riot.region;

    // append region to div
    regionDiv.appendChild(region);
    textDiv.appendChild(regionDiv);

    // last message text
    const lastMessagePreviewDiv = document.createElement("div");
    lastMessagePreviewDiv.classList.add("row", "row-12"); 

    // last message
    const lastMessagePreview = document.createElement("p");
    lastMessagePreview.classList.add("fw-light");

    // Append You / sommonername dependant on who sent the last message
    if (lastMessage.from !== conversationPartner._id) {
        lastMessagePreview.innerText = "You: " + lastMessage.body;

    } else {
        lastMessagePreview.innerText = lastUserSummonerName + ": " + lastMessage.body;
    }

    // apppend last message to div
    lastMessagePreviewDiv.appendChild(lastMessagePreview);
    textDiv.appendChild(lastMessagePreviewDiv);
    conversationDiv.appendChild(textDiv);

    // append conversation to div
    link.appendChild(conversationDiv);
    divToAppendTo.appendChild(link);
}

function generateMessengerContainer(conversationPartnerSummonerName, conversationPartnerRegion) {
    const conversationPartnerIdentifier = conversationPartnerSummonerName + "-" + conversationPartnerRegion;
    const listConversationDiv = document.createElement("div");
    listConversationDiv.classList.add("tab-pane", "fade", "row");
    listConversationDiv.setAttribute("role", "tabpanel");
    listConversationDiv.setAttribute("aria-labelledby", conversationPartnerIdentifier);
    listConversationDiv.id = "list-" + conversationPartnerIdentifier;

    return listConversationDiv;
}

// Generates a message container. Aligns left/right dependant sender and session info
/**
 * 
 * @param {String} message message body 
 * @param {String} from string formatted mongoDB ObjectId containing message sender ObjectId 
 * @param {String} sessionIdentifier string formatted mongoDB ObjectId containing currently logged in user ObjectId 
 * @param {HTMLCollection} divToAppendTo div to append message div to 
 */
function generateMessage (message, from,  sessionIdentifier, divToAppendTo ) {
    const wrapperMessageDiv = document.createElement("div");
    wrapperMessageDiv.classList.add("row");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("col", "col-4", "my-1", "rounded-start");

    const messageText = document.createElement("p");
    messageText.classList.add("message-text");
    messageText.innerText = message;
    
    // display messages left/right dependent on sender
    if (from === sessionIdentifier) {
        wrapperMessageDiv.classList.add("justify-content-end");
        messageDiv.classList.add("chat-right", "d-flex", "justify-content-end", "align-items-center");

    } else{
        messageDiv.classList.add("chat-left", "d-flex", "justify-content-start");
    }

    messageDiv.appendChild(messageText);
    wrapperMessageDiv.appendChild(messageDiv);
    divToAppendTo.appendChild(wrapperMessageDiv);
}

function generateConversationAndMessageContainer(conversationPartner, lastUserSummonerName, message, receiver) {
    // create lastMessage object
    const lastMessage = {
        from: lastUserSummonerName,
        body: message
    };

    // get wrapper divs for conversations (left) and messenger (right)             
    const conversationsDiv = document.getElementById("conversations-div");

    // create new conversation element to the left
    generateConversation (conversationPartner, lastUserSummonerName, lastMessage, conversationsDiv); 

    // create messenger div
    const listConversationDiv = generateMessengerContainer(receiver.summonerName, receiver.region);
    
    return listConversationDiv;
}

async function getUserFromSession() {
    const response = await fetch("/api/session/user");
    return await response.json();
}

async function getUserBySummonerNameAndRegion(region, summonerName) {
    const response = await fetch("/api/users/" + summonerName + "/" + region);
    if (response.ok === true){
        return await response.json();
    } else {
        return null;
    }
}

async function getMessagesFromDB() {
    const response = await fetch("/api/session/chats");

    return await response.json();
}

function resetMessageInputs() {
    document.getElementById("new-conversation-input").value = "";
    document.getElementById("message-input").value = "";
}
