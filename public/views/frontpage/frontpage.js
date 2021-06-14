import { getUser } from "/js/api.js";

(function initializeSearchListener() {
    const searchInput = document.getElementById("search-input");
    const regionSelect = document.getElementById("select-region");

    // triggers whenever a user hits "enter" in the search input
    // will redirect to profile page if user exists, and show error if not
    searchInput.addEventListener("search", async () => {
        const region = regionSelect.value.toLowerCase();
        const summonerName = searchInput.value;
        const currentUrl = location.href;

        const user = await getUser(summonerName, region);

        if (user.error) {
            toastr.error("User " + summonerName + " not found.");
            searchInput.value = "";

        } else {
            location.href = currentUrl + "profile/" + summonerName + "/" + region;
        }
    });

})();
