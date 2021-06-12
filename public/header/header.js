(function toastrSettings() {
    toastr.options.closeButton = true;
    toastr.options.timeOut = 5000;
    toastr.options.progressBar = true;

    toastr.options.showMethod = 'slideDown';
    toastr.options.hideMethod = 'slideUp';
    toastr.options.closeMethod = 'slideUp';
})();

(function showToastr() {
    const searchParams = new URLSearchParams(location.search);

    if (searchParams.has("error")) {
        toastr.error(searchParams.get("error"));

    } else if (searchParams.has("success")) {
        toastr.success(searchParams.get("success"));
    }

})();

(async function getNavbarItemsFromSession() {
    try {
        const response = await fetch("/auth/is-logged-in");
        const loggedIn = await response.json().then(res => res.data);

        // create navbar
        const navbarItems = document.getElementById("navbarItems");

        if (loggedIn) {
            // create profile
            const profile = document.createElement("li");
            profile.classList.add("nav-item", "active");

            const profileLink = document.createElement("a");
            profileLink.classList.add("nav-link");

            const user = await getUser();

            profileLink.href = "/profile/" + user.riot.summonerName + "/" + user.riot.region;
            profileLink.innerText = user.riot.summonerName;

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

        } else {
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

    } catch (error) {
        console.log(error);
    }

})();

async function getUser() {
    const response = await fetch("/api/session/user");

    return response.json();
}
