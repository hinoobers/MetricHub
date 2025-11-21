require("dotenv").config();
const { db } = require('../../util/database');

const edit = async (req, res) => {
    const id = req.params.id ? parseInt(req.params.id) : null;
    const {
        name,
        page
    } = req.body;

    if(!id || typeof id !== 'number') {
        return res.status(400).json({ error: "Missing or invalid 'id' field" });
    }

    const updates = []; 
    const values = []; 

    if(name !== undefined) {
        updates.push("instance_name = ?");
        values.push(name);
    }

    if(page !== undefined) {
        updates.push("page = ?");
        values.push(JSON.stringify(page));
    }

    if(updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }

    const setClause = updates.join(', ');

    values.push(id, req.user.id);

    try {
        const [result] = await db.query(
            `UPDATE tracked_instances SET ${setClause} WHERE id = ? AND user_id = ?`,
            values
        );

        if(result.affectedRows === 1) {
            return res.json({ message: "Instance updated successfully" });
        } else if (result.affectedRows === 0) {
             return res.status(404).json({ error: "Instance not found or unauthorized" });
        } else {
            return res.status(500).json({ error: "Failed to update instance" });
        }
    } catch (error) {
        console.error("Database error during update:", error);
        return res.status(500).json({ error: "Failed to update instance" });
    }
}

module.exports = edit;