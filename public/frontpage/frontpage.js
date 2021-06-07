(function initializeSearchListener() {
    const searchInput = document.getElementById("search-input");
    const regionSelect = document.getElementById("select-region");

    searchInput.addEventListener("search", () => {
        const region = regionSelect.value.toLowerCase();
        const summonerName = searchInput.value;
        const currentUrl = location.href;

        location.href = currentUrl + "profile/" + summonerName + "/" + region;
    });

})();

(function showToastrMessageIfAny() {
    const error = sessionStorage.getItem("error");
    const success = sessionStorage.getItem("success");

    if (error) {
        toastr.error(error);

    } else if (success) {
        toastr.success(success);
    }

    sessionStorage.clear();
})();
