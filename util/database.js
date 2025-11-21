const mysql2 = require('mysql2/promise');
require("dotenv").config();
const pool = mysql2.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const initTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(512) NOT NULL
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS tracked_instances (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            instance_name VARCHAR(255) NOT NULL,
            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS instance_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            instance_id INT NOT NULL,
            instance_version TEXT,
            operating_system TEXT,
            java_version TEXT,
            custom_data LONGTEXT,
            date DATETIME,
            FOREIGN KEY (instance_id)
                REFERENCES tracked_instances(id)
                ON DELETE CASCADE
        )
    `);
};


module.exports = {db: pool, initTables};