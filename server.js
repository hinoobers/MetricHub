require("dotenv").config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY

const {db, initTables} = require('./util/database');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("frontend/"));

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    jsonwebtoken.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or expired token" });
        req.user = user;
        next();
    });
}


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

app.get("/instances", authenticateToken, async (req, res) => {
    const [instances] = await db.query("SELECT * FROM tracked_instances WHERE user_id = ?", [req.user.id]);
    res.json({ instances });
});

app.post("/login", async (req, res) => {
    const { 
        email,
        password 
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: "Invalid data types" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jsonwebtoken.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' } // token expires in 1 hour
    );

    res.json({ message: "Login successful", token });
});

app.post("/register", async (req, res) => {
    const {
        email, 
        username,
        password
    } = req.body;

    if(!email || !username || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if(typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: "Invalid data types" });
    }

    if(password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const [existingUserByEmail] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if(existingUserByEmail.length > 0) {
        return res.status(400).json({ error: "Email already in use" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query("INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)", [email, username, password_hash]);
    if(result.affectedRows === 1) {
        return res.status(201).json({ message: "User registered successfully" });
    } else {
        return res.status(500).json({ error: "Failed to register user" });
    }
});

app.listen(3000, () => {
    initTables();
    console.log('Server is running on http://localhost:3000');
});