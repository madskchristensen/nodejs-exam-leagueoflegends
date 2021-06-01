(async function getMessages() {
    try {
        // TO DO
        // GET all conversations that logged in user is part of

        // test messenger object
        // only 2 as of now. there of course could be multiple
        // 
        const testMessengerObject1 = {
            participants: [
                {
                userObjectId: "qjtqnt814813413"
                },
                {
                userObjectId: "ojriqnmiq5161"
                }
            ],
            messages: [
                {
                from: "qjtqnt814813413",
                body: "Hey you",
                timestamp: "Wed May 19 2021 20:07:12 GMT+0200"
                },
                {
                from: "qjtqnt814813413",
                body: "Why are you not answering",
                timestamp: "Wed May 19 2021 20:07:15 GMT+0200"
                },
                {
                from: "ojriqnmiq5161",
                body: "Im busy grinding m8",
                timestamp: "Wed May 19 2021 20:15:56 GMT+0200"
                }
            ]
        }

        const testMessengerObject2 = {
            participants: [
                {
                userObjectId: "qjtqnt814813413abc"
                },
                {
                userObjectId: "ojriqnmiq5161"
                }
            ],
            messages: [
                {
                from: "qjtqnt814813413abc",
                body: "Hey you",
                timestamp: "Wed May 19 2021 20:07:12 GMT+0200"
                },
                {
                from: "qjtqnt814813413abc",
                body: "Why are you not answering.. omg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg plsomg pls",
                timestamp: "Wed May 19 2021 20:07:15 GMT+0200"
                },
                {
                from: "ojriqnmiq5161",
                body: "Now im not busy grinding",
                timestamp: "Wed May 19 2021 20:15:56 GMT+0200"
                }
            ]
        }

        const messages = [testMessengerObject1, testMessengerObject2];
        
        // TO DO
        // GET all summoner details from conversations above from userObjectId from DB
        // summoner details wanted:
            // id
            // summonerName
            // summonerIcon

        // test summoners for now
        const testSummoners = [{
                id: "qjtqnt814813413",
                riot: {
                    summonerName: "Jens",
                    summonerIcon: "4301"
                }
            },
            {
                id: "ojriqnmiq5161",
                riot: {
                  summonerName: "Not Jens",
                  summonerIcon: "420"
              }
            },
            {
                id: "qjtqnt814813413abc",
                riot: {
                  summonerName: "Jensen",
                  summonerIcon: "55"
              }
            }
        ]

        // TO DO 
        // Not sure atm. how we do this, but loggedIn userID saved as const for now. Match with sessionId?
        const loggedInUserId = "ojriqnmiq5161";
        
        const messagesDiv = document.getElementById("messages-div");
        const messengerDiv = document.getElementById("messenger-div")
        messages.forEach(conversation => {
            // outside link
            const link = document.createElement("a");
            link.classList.add("list-group-item", "list-group-item-action", "conversation-link");
            link.setAttribute("data-bs-toggle", "list")
            link.setAttribute("role", "tab");
            // wrapper div
            const conversationDiv = document.createElement("div");
            conversationDiv.classList.add("row");

            // div for summoner icon
            const iconDiv = document.createElement("div");
            iconDiv.classList.add("col", "col-4", "py-3");

            // create unique identifier for conversation based on participant IDs
            // sort names
            //const sortedConversationParticipants = conversation.participants.sort((a, b) => a.userObjectId.localeCompare(b.userObjectId));
            //conversationIdentifier = sortedConversationParticipants[0].userObjectId + "-" + sortedConversationParticipants[1].userObjectId;
            
            // find user that itsn't the logged in user
            const conversationPartnerId = conversation.participants.find( ({ userObjectId }) => userObjectId !== loggedInUserId );
            // get conversation partner object from id
            const conversationPartner = testSummoners.find( ({ id }) => id === conversationPartnerId.userObjectId );
            // save conversation partner summoner name to use as identifier
            const conversationPartnerSummonerName = conversationPartner.riot.summonerName;
            // add id to user link
            link.href="#list-" + conversationPartnerSummonerName
            link.setAttribute("aria-controls", conversationPartnerSummonerName);
            link.id = conversationPartnerSummonerName;

            // summoner icon
            // display icon of conversation partner
            const summonerIcon = document.createElement("img");
            summonerIcon.classList.add("img-fluid", "w-100");
            
            summonerIcon.src = "http://ddragon.leagueoflegends.com/cdn/11.11.1/img/profileicon/" + conversationPartner.riot.summonerIcon + ".png";
           
            // get last messageObject that sent message
            const lastMessage = conversation.messages[messages.length];
            console.log(lastMessage);
            
            // match message object with user
            let lastUser;

            testSummoners.forEach(testSummoner => {
                if (testSummoner.id === lastMessage.from) {
                    lastUser = testSummoner;
                }
            });         

           // append summoner icon to div
           iconDiv.appendChild(summonerIcon);
           conversationDiv.appendChild(iconDiv)

           // wrapper div for name and message
           const textDiv = document.createElement("div");
           textDiv.classList.add("col", "col-8");

           // div for summoner name
           const nameDiv = document.createElement("div");
           nameDiv.classList.add("row", "row-12");
           
           // summoner name
           const summonerName = document.createElement("h4");
           summonerName.classList.add("pt-3");
           summonerName.innerText = conversationPartnerSummonerName;

           // append summoner name to div
           nameDiv.appendChild(summonerName);
           textDiv.appendChild(nameDiv);
           
           // last message text
           const lastMessagePreviewDiv = document.createElement("div");
           lastMessagePreviewDiv.classList.add("row", "row-12"); 

           // last message
           const lastMessagePreview = document.createElement("p");
           lastMessagePreview.classList.add("fw-light")
           if (lastMessage.from === loggedInUserId) {
            lastMessagePreview.innerText = "You: " + lastMessage.body;
           }
           else{
            lastMessagePreview.innerText = lastUser.riot.summonerName + ": " + lastMessage.body;
           }

           // apppend last message to div
           lastMessagePreviewDiv.appendChild(lastMessagePreview);
           textDiv.appendChild(lastMessagePreviewDiv);

           conversationDiv.appendChild(textDiv);

           // append conversation to div
           link.appendChild(conversationDiv);

           messagesDiv.appendChild(link);


           // ******main content conversation*******
           const listConversationDiv = document.createElement("div");
           listConversationDiv.classList.add("tab-pane", "fade", "row");
           listConversationDiv.setAttribute("role", "tabpanel");
           listConversationDiv.setAttribute("aria-labelledby", conversationPartnerSummonerName);
           listConversationDiv.id = "list-" + conversationPartnerSummonerName;

           // create wrapper div for message


           // loop through messages in conversation and append them to list
           conversation.messages.forEach(message => {
                const wrapperMessageDiv = document.createElement("div");
                wrapperMessageDiv.classList.add("row");

                const messageDiv = document.createElement("div");
                messageDiv.classList.add("col", "col-4", "my-1", "rounded-start");

                const messageText = document.createElement("p");
                messageText.classList.add("message-text")
                messageText.innerText = message.body;
                
                if (message.from === loggedInUserId) {
                    wrapperMessageDiv.classList.add("justify-content-end")
                    messageDiv.classList.add("chat-right", "d-flex", "justify-content-end", "align-items-center");
                }    
                else{
                    messageDiv.classList.add("chat-left", "d-flex", "justify-content-start");
                }

                messageDiv.appendChild(messageText);
                wrapperMessageDiv.appendChild(messageDiv);
                listConversationDiv.appendChild(wrapperMessageDiv);
           })
           messengerDiv.appendChild(listConversationDiv);

        })
    }
    catch(error) {
        console.log(error);
    }
})();   


