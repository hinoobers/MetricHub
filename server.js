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


app.get("/status", async (req, res) => {
    const [userCount] = await db.query("SELECT COUNT(*) AS userCount FROM users");
    const [instanceCount] = await db.query("SELECT COUNT(*) AS instanceCount FROM tracked_instances");

    res.json({ status: "Server is running", userCount: userCount[0].userCount, instanceCount: instanceCount[0].instanceCount });
});
app.post("/collect-data", async (req, res) => {

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