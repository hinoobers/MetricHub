document.addEventListener("DOMContentLoaded", function() {
    if(window.location.pathname == "/index.html" || window.location.pathname == "/") {
        fetch("/status", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json()).then(data => {
            document.getElementById("statistics").innerText = document.getElementById("statistics").innerText.replace("{x}", data.userCount).replace("{y}", data.instanceCount);
        });
    }
});