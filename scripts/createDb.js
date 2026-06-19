const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: ''
    });

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`procxa\`;`);
        console.log("✅ Database 'procxa' created or already exists.");
    } catch (err) {
        console.error("❌ Error creating database:", err.message);
    } finally {
        await connection.end();
    }
}

createDb();
