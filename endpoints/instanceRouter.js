const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY;

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

router.get('/list', authenticateToken, require('./instance/list'));
router.post("/create", authenticateToken, require('./instance/create'));
router.get("/view/:id", require('./instance/instancedata'));
router.put("/edit/:id", authenticateToken, require('./instance/edit'));

module.exports = router;