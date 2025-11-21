require("dotenv").config();
const { db } = require('../../util/database');

const instancedata = async (req, res) => {
    const id = req.params.id ? parseInt(req.params.id) : null;

    if(!id || typeof id !== 'number') {
        return res.status(400).json({ error: "Missing or invalid 'id' field" });
    }

    const [instances] = await db.query(
        "SELECT * FROM tracked_instances WHERE id = ?", 
        [id]
    );
    if(instances.length === 0) {
        return res.status(404).json({ error: "Instance not found" });
    }

    const [data] = await db.query(
        "SELECT * FROM instance_data WHERE instance_id = ? ORDER BY date DESC", 
        [id]
    );

    //  CREATE TABLE IF NOT EXISTS instance_data (
        //     id INT AUTO_INCREMENT PRIMARY KEY,
        //     instance_id INT NOT NULL,
        //     instance_version TEXT,
        //     operating_system TEXT,
        //     java_version TEXT,
        //     custom_data LONGTEXT,
        //     client_id CHAR(32),
        //     date DATETIME,
        //     FOREIGN KEY (instance_id)
        //         REFERENCES tracked_instances(id)
        //         ON DELETE CASCADE
        // )

    // Frontend needs to draw beautiful graphs/chart from the data we give it
    // obv we want most optimized way to do that

    const formattedData = data.map(row => ({
        sys_data: JSON.parse(row.data),
        custom: row.custom_data ? JSON.parse(row.custom_data) : null,
        timestamp: row.date.getTime() // easier for JS chart libraries
    }));

        return res.json({
            data: formattedData,
            statistics: {
                instanceName: instances[0].instance_name,
                totalEntries: data.length,
                uniqueClients: new Set(data.map(d => d.client_id)).size,
            },
            page: JSON.parse(instances[0].page).map(d => {
                const dataField = d.dataField;
                return {
                    ...d,
                    labels: formattedData.map(entry => (entry.sys_data && entry.sys_data[dataField]) || null),
                    data: formattedData.map(entry => {
                        if (dataField === 'date') {
                            return entry.timestamp;
                        } else {
                            // return count of unique values for this field across entries
                            return new Set(formattedData.map(e => (e.sys_data && e.sys_data[dataField]) || null)).size;
                        }
                    }),
                    x: formattedData.map(entry => entry.timestamp)
                };
            })
        });
}

module.exports = instancedata;