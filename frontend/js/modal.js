function showModal(title, input, actions) {
    const modal = document.getElementsByClassName("modal")[0];
    modal.querySelector(".modal-title").innerText = title;
    modal.querySelector(".modal-content").innerHTML = input;
    const actionsContainer = modal.querySelector(".modal-actions");
    actionsContainer.innerHTML = actions;
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementsByClassName("modal")[0];
    modal.style.display = "none";
}