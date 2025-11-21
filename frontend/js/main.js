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
    } else if(window.location.pathname == "/dashboard.html") {
        fetch("/instances", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        }).then(response => response.json()).then(data => {
            const tbody = document.querySelector("#instance-table tbody");
            data.instances.forEach(instance => {
                const tr = document.createElement("tr");

                const tdId = document.createElement("td");
                tdId.innerText = instance.id; 
                tr.appendChild(tdId);

                const tdName = document.createElement("td");
                tdName.innerText = instance.instance_name; 
                tr.appendChild(tdName);

                tbody.appendChild(tr);
            });
        });

        document.getElementById("add-button").addEventListener("click", function() {
            const input = `
                <label for="instance-name">Instance Name:</label>
                <input type="text" id="instance-name" name="instance-name" required>
            `;
            const actions = `
                <button id="cancel-btn" onclick="closeModal()">Cancel</button>
                <button id="add-btn">Add Instance</button>
            `;
            showModal("Add New Instance", input, actions);
        });
    }
});