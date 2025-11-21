require("dotenv").config();
const { db } = require('../../util/database');

const instances = async (req, res) => {
    const [instances] = await db.query("SELECT * FROM tracked_instances WHERE user_id = ?", [req.user.id]);
    res.json({ instances });
}

module.exports = instances;