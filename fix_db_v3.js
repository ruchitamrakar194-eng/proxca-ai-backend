const db = require("./config/config");

const fixDatabase = async () => {
    try {
        console.log("Checking and fixing database columns (v3)...");
        
        // 1. Check for emailSubject in contract_preferences
        const [preferencesCols] = await db.sequelize.query("SHOW COLUMNS FROM `contract_preferences` LIKE 'emailSubject'");
        if (preferencesCols.length === 0) {
            console.log("Adding 'emailSubject' column to contract_preferences...");
            await db.sequelize.query("ALTER TABLE `contract_preferences` ADD COLUMN `emailSubject` VARCHAR(255) NULL AFTER `emailBody`;");
            console.log("✅ Column 'emailSubject' added.");
        } else {
            console.log("Column 'emailSubject' already exists in contract_preferences.");
        }

        console.log("Database fix v3 completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fixing database v3:", error);
        process.exit(1);
    }
};

fixDatabase();
