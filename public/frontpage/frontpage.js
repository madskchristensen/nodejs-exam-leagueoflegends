  // const express = require("express").Router;
  //const router = express.Router();

(async function getFrontpageFromSession() {
    try {
        const response = await fetch("/getSession");
        const result = await response.json();

        console.log(result);

        // create frontpage
        const frontpageDiv = document.getElementById("frontpage");

        const message = document.createElement("p");

        if (result.session.loggedIn === true) {
            console.log(result.session.loggedIn);
            message.innerText = "You are logged in"
        }
        else if (result.session.loggedIn === false || !result.session.loggedIn) {
            console.log(result.session.loggedIn);
            message.innerText = "You are not logged in"
        }

        frontpageDiv.appendChild(message);
    }
    catch(error) {
        console.log(error);
    }
})();

