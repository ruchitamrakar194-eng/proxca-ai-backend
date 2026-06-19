const db = require("./config/config");

const fixDatabase = async () => {
    try {
        console.log("Checking and fixing database columns...");
        
        // 1. Check for emailBody in contract_preferences
        const [preferencesCols] = await db.sequelize.query("SHOW COLUMNS FROM `contract_preferences` LIKE 'emailBody'");
        if (preferencesCols.length === 0) {
            console.log("Adding 'emailBody' column to contract_preferences...");
            await db.sequelize.query("ALTER TABLE `contract_preferences` ADD COLUMN `emailBody` TEXT NULL AFTER `status`;");
            console.log("✅ Column 'emailBody' added.");
        } else {
            console.log("Column 'emailBody' already exists in contract_preferences.");
        }

        // 2. Check and fix email_templates table
        const [templateTables] = await db.sequelize.query("SHOW TABLES LIKE 'email_templates'");
        if (templateTables.length === 0) {
            console.log("Creating 'email_templates' table...");
            // Force sync just for this model
            await db.email_template.sync({ alter: true });
            console.log("✅ Table 'email_templates' created.");
        } else {
            console.log("Table 'email_templates' already exists.");
        }

        console.log("Database fix completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fixing database:", error);
        process.exit(1);
    }
};

fixDatabase();
