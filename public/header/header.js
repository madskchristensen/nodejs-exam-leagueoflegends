
  (async function getNavbarItemsFromSession() {
    try {
        const response = await fetch("/getSession");
        const result = await response.json();

        // create navbar
        const navbarItems = document.getElementById("navbarItems");

        if (result.session.loggedIn === true) {

            // create profile
            const profile = document.createElement("li");
            profile.classList.add("nav-item", "active");

            const profileLink = document.createElement("a");
            profileLink.classList.add("nav-link");
            profileLink.href = "/profile";
            profileLink.innerText = "Profile";

            profile.appendChild(profileLink);
            navbarItems.appendChild(profile);

            // create messenger
            const messenger = document.createElement("li");
            messenger.classList.add("nav-item", "active");

            const messengerLink = document.createElement("a");
            messengerLink.classList.add("nav-link");
            messengerLink.href = "/messenger";
            messengerLink.innerText = "Messenger";

            messenger.appendChild(messengerLink);
            navbarItems.appendChild(messenger);

            // create signout 
            const signout = document.createElement("li");
            signout.classList.add("nav-item", "active");
            
            const signoutForm = document.createElement("form");
            signoutForm.method = "POST";
            signoutForm.action = "/auth/signout";

            const signoutButton = document.createElement("button");
            signoutButton.type = "submit";
            signoutButton.classList = "signout";
            signoutButton.innerText = "Sign out";

            signoutForm.appendChild(signoutButton);
            signout.appendChild(signoutForm);
            navbarItems.appendChild(signoutForm);
        }
        else if (result.session.loggedIn === false || !result.session.loggedIn) {

            // create login
            const login = document.createElement("li");
            login.classList.add("nav-item", "active");

            const loginLink = document.createElement("a");
            loginLink.classList.add("nav-link");
            loginLink.href = "/login";
            loginLink.innerText = "Login";

            login.appendChild(loginLink);
            navbarItems.appendChild(login);
        }
    }
    catch(error) {
        console.log(error);
    }
})();

