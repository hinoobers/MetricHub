const express = require('express');
const app = express();

const db = require('./util/database');

app.use(express.json());

() => {
    db.prepare("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), username VARCHAR(255) UNIQUE, password_hash VARCHAR(255))").run();
    db.prepare("CREATE TABLE IF NOT EXISTS tracked_instances (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, instance_name VARCHAR(255), FOREIGN KEY (user_id) REFERENCES users(id))").run();
    db.prepare("CREATE TABLE IF NOT EXISTS instance_data (id INT AUTO_INCREMENT PRIMARY KEY, instance_id INT, instance_version TEXT, operating_system TEXT, java_version TEXT, custom_data LONGTEXT, date DATETIME, FOREIGN KEY (instance_id) REFERENCES tracked_instances(id) ON DELETE CASCADE)").run();
};

app.get("/status", async (req, res) => {
    res.json({ status: "Server is running" });
});
app.post("/collect-data", async (req, res) => {

});

app.post("/login", async (req, res) => {

});

app.post("/register", async (req, res) => {

});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});