const db = require('./config/config');

async function fixSchema() {
    const queryInterface = db.sequelize.getQueryInterface();
    try {
        const tableInfo = await queryInterface.describeTable('costSavings');
        console.log("Current columns:", Object.keys(tableInfo));
        
        const columnsToAdd = [
            { name: 'requesterName', type: db.Sequelize.STRING },
            { name: 'departmentId', type: db.Sequelize.BIGINT },
            { name: 'group', type: db.Sequelize.STRING },
            { name: 'intakeRequest', type: db.Sequelize.BIGINT }
        ];

        for (const col of columnsToAdd) {
            if (!tableInfo[col.name]) {
                try {
                   console.log(`Adding column: ${col.name}`);
                   await queryInterface.addColumn('costSavings', col.name, {
                       type: col.type,
                       allowNull: true
                   });
                   console.log(`✅ Column ${col.name} added successfully.`);
                } catch (e) {
                   console.log(`❌ Failed to add column ${col.name}: ${e.message}`);
                }
            } else {
                console.log(`ℹ️ Column ${col.name} already exists.`);
            }
        }
    } catch (error) {
        console.error("❌ Error fixing schema:", error.message);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

fixSchema();
