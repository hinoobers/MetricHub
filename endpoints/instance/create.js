require("dotenv").config();
const { db } = require('../../util/database');

const create = async (req, res) => {
    const {name} = req.body;

    if(!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'name' field" });
    }

    const [result] = await db.query(
        "INSERT INTO tracked_instances (user_id, instance_name) VALUES (?, ?)", 
        [req.user.id, name]
    );

    if(result.affectedRows === 1) {
        return res.status(201).json({ message: "Instance created successfully", instanceId: result.insertId });
    } else {
        return res.status(500).json({ error: "Failed to create instance" });
    }
}

module.exports = create;