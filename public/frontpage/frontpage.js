(function initializeSearchListener() {
    const searchInput = document.getElementById("search-input");
    const regionSelect = document.getElementById("select-region");

    searchInput.addEventListener("search", () => {
        const region = regionSelect.value.toLowerCase();
        const summonerName = searchInput.value;
        const currentUrl = location.href;

        location.href = currentUrl + "profile/" + summonerName + "/" + region;
    })

})();
