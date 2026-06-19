const db = require('./config/config');

async function fixDatabase() {
    try {
        console.log("Checking database schema...");
        const queryInterface = db.sequelize.getQueryInterface();

        // Check if column exists
        const tableDesc = await queryInterface.describeTable('contract_templates');

        if (!tableDesc.templateContent) {
            console.log("⚠️ Column 'templateContent' not found. Adding it now...");
            await queryInterface.addColumn('contract_templates', 'templateContent', {
                type: db.Sequelize.TEXT,
                allowNull: true
            });
            console.log("✅ Column 'templateContent' added successfully.");
        } else {
            console.log("✅ Column 'templateContent' already exists.");
        }

    } catch (error) {
        console.error("❌ Error applying fix:", error);
    } finally {
        process.exit();
    }
}

// Wait for connection
setTimeout(fixDatabase, 2000);
