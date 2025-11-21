require("dotenv").config();
const express = require('express');
const app = express();

const {db, initTables} = require('./util/database');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("frontend/"));



app.get("/status", async (req, res) => {
    const [userCount] = await db.query("SELECT COUNT(*) AS userCount FROM users");
    const [instanceCount] = await db.query("SELECT COUNT(*) AS instanceCount FROM tracked_instances");

    res.json({ status: "Server is running", userCount: userCount[0].userCount, instanceCount: instanceCount[0].instanceCount });
});
app.post("/collect-data", async (req, res) => {
    const {
        instance_id,
        instance_version,
        operating_system,
        java_version,
        custom_data,
        client_id
    } = req.body;

    if (!instance_id || !client_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof instance_id !== 'number' || typeof client_id !== 'string') {
        return res.status(400).json({ error: "Invalid data types" });
    }

    if(client_id.length !== 32) {
        return res.status(400).json({ error: "Invalid client_id length" });
    }

    try {
        JSON.parse(custom_data);
    } catch (e) {
        return res.status(400).json({ error: "custom_data must be valid JSON" });
    }

    const [instances] = await db.query("SELECT * FROM tracked_instances WHERE id = ?", [instance_id]);
    if (instances.length === 0) {
        return res.status(400).json({ error: "Instance not found" });
    }

    const date = new Date();
    const [result] = await db.query(
        "INSERT INTO instance_data (instance_id, instance_version, operating_system, java_version, custom_data, client_id, date) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [instance_id, instance_version, operating_system, java_version, custom_data, client_id, date]
    );
    if(result.affectedRows === 1) {
        return res.status(201).json({ message: "Data registered successfully" });
    } else {
        return res.status(500).json({ error: "Failed to register data" });
    }
});

app.use('/auth', require('./endpoints/authRouter'));
app.use("/instance", require('./endpoints/instanceRouter'));
app.listen(3000, () => {
    initTables();
    console.log('Server is running on http://localhost:3000');
});