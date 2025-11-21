require("dotenv").config();
const bcrypt = require('bcrypt');
const { db } = require('../../util/database');

const register = async (req, res) => {
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
}

module.exports = register;