document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if(loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            }).then(response => response.json()).then(data => {
                if(data.error) {
                    alert("Login failed: " + data.error);
                } else {
                    localStorage.setItem("token", data.token);
                    window.location.href = "/dashboard.html";
                }
            });
        });
    }

    if(registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            fetch("/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, username, password })
            }).then(response => response.json()).then(data => {
                if(data.error) {
                    alert("Login failed: " + data.error);
                } else {
                    window.location.href = "/login.html";
                }
            });
        });
    }
});