function addInstance(name) {
    fetch("/instance/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ name })
    }).then(response => response.json()).then(data => {
        if(data.error) {
            alert("Failed to add instance: " + data.error);
        } else {
            closeModal();
            location.reload();
        }
    });
}

function addPageContent(sysDataFields, customDataFields) {
    const pageContents = document.querySelector("#page-contents");
    const contentDiv = document.createElement("div");
    contentDiv.className = "page-content";
    contentDiv.innerHTML = `
        <p>Data Type</p>
        <select class="data-select">
        ${Object.keys(sysDataFields).map(field => `
            <option value="${field}" ${content.dataField === field ? "selected" : ""}>${field}</option>
        `).join('')}
        ${JSON.parse(customDataFields).map(field => `
            <option value="${field.name}" ${content.dataField === field ? "selected" : ""}>${field.name}</option>
        `).join('')}
        </select>
        <p>Chart Type</p>
        <select class="chart-type-select">
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
        </select>
        <button onclick="this.parentElement.remove()">Remove</button>
    `;
    pageContents.appendChild(contentDiv);
}

function savePageContents(instanceId) {
    const contents = [];
    document.querySelectorAll(".page-content").forEach(contentDiv => {
        const dataType = contentDiv.querySelector(".data-select").value;
        const chartType = contentDiv.querySelector(".chart-type-select").value;
        contents.push({
            type: chartType,
            title: dataType.replace("_", " ").toUpperCase() + " Distribution",
            labels: [], // Labels will be filled in server-side
            data: [],   // Data will be filled in server-side
            dataField: dataType
        });
    });

    fetch(`/instance/edit/${instanceId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ page: contents })
    }).then(response => response.json()).then(data => {
        if(data.error) {
            alert("Failed to save changes: " + data.error);
        } else {
            closeModal();
            location.reload();
        }
    });
}

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
        fetch("/instance/list", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        }).then(response => response.json()).then(async data => {
            const tbody = document.querySelector("#instance-table tbody");
            data.instances.forEach(async instance => {
                const tr = document.createElement("tr");

                const tdId = document.createElement("td");
                tdId.innerText = instance.id; 
                tr.appendChild(tdId);

                const tdName = document.createElement("td");
                tdName.innerText = instance.instance_name; 
                tr.appendChild(tdName);

                const tdPageLink = document.createElement("td");
                const viewButton = document.createElement("button");
                viewButton.innerText = "View";
                viewButton.addEventListener("click", function() {
                    window.location.href = `/instance.html?id=${instance.id}`;
                });

                const editButton = document.createElement("button");
                editButton.innerText = "Edit";
                editButton.addEventListener("click", async function() {
                    const contents = JSON.parse(instance.page || "[]");
                    
                    const response = await fetch(`/instance/view/${instance.id}`, {
                        method: 'GET',
                        headers: { 
                            'Content-Type': 'application/json',
                        }
                    });
                    const { data } = await response.json();
    
                    console.log(data[0].sys_data)

                    const input = `
                        <div id="page-contents">
                            ${contents.map(content => `
                                <div class="page-content">
                                    <p>Data Type</p>
                                    <select class="data-select">
                                    ${Object.keys(data[0].sys_data).map(field => `
                                        <option value="${field}" ${content.dataField === field ? "selected" : ""}>${field}</option>
                                    `).join('')}
                                        ${JSON.parse(instance.custom_data).map(field => `
                                            <option value="${field.name}" ${content.dataField === field ? "selected" : ""}>${field.name}</option>
                                        `).join('')}
                                    </select>
                                    <p>Chart Type</p>
                                    <select class="chart-type-select">
                                        <option value="pie" ${content.type === "pie" ? "selected" : ""}>Pie Chart</option>
                                        <option value="bar" ${content.type === "bar" ? "selected" : ""}>Bar Chart</option>
                                        <option value="line" ${content.type === "line" ? "selected" : ""}>Line Chart</option>
                                    </select>
                                    <button onclick="this.parentElement.remove()">Remove</button>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick='addPageContent(${JSON.stringify(data[0].sys_data)}, ${JSON.stringify(instance.custom_data)})'>Add Content</button>
                    `;

                    const actions = `
                        <button id="cancel-btn" onclick="closeModal()">Cancel</button>
                        <button id="save-btn" onclick="savePageContents(${instance.id})">Save Changes</button>
                    `;

                    showModal("Edit Page", input, actions);
                });

                tdPageLink.appendChild(viewButton);
                tdPageLink.appendChild(editButton);
                tr.appendChild(tdPageLink);

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
                <button id="add-btn" onclick="addInstance(document.getElementById('instance-name').value)">Add Instance</button>
            `;
            showModal("Add New Instance", input, actions);
        });
    }
});