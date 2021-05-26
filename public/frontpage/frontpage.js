(async function getFrontpageFromSession() {
    try {
        const response = await fetch("/getSession");
        const result = await response.json();

        // create frontpage
        const frontpageDiv = document.getElementById("frontpage");

        const message = document.createElement("p");

        if (result.session.loggedIn === true) {
            console.log(result.session.loggedIn);
            message.innerText = "You are logged in"
            
            const signoutForm = document.createElement("form");
            signoutForm.method = "POST";
            signoutForm.action = "/api/auth/signout";

            const signoutButton = document.createElement("input");
            signoutButton.type = "submit";
            signoutButton.value = "Sign out";

            signoutForm.appendChild(signoutButton);
            frontpageDiv.appendChild(signoutForm);
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

