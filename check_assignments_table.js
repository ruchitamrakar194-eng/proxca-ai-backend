const db = require('./config/config');

async function checkTable() {
    try {
        const [results] = await db.sequelize.query("DESCRIBE client_license_assignments");
        console.log("Structure of client_license_assignments:");
        console.table(results);
        process.exit(0);
    } catch (error) {
        console.error("❌ Table does not exist or error:", error.message);
        process.exit(1);
    }
}

checkTable();
