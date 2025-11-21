require("dotenv").config();
const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY;
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { db } = require('../../util/database');

const login = async (req, res) => {
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
}

module.exports = login;