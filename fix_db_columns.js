const db = require('./config/config');

async function fixSchema() {
    const queryInterface = db.sequelize.getQueryInterface();
    try {
        const tableInfo = await queryInterface.describeTable('costSavings');
        
        const columnsToAdd = [
            { name: 'requesterName', type: db.Sequelize.STRING, allowNull: true },
            { name: 'departmentId', type: db.Sequelize.BIGINT, allowNull: true }
        ];

        for (const col of columnsToAdd) {
            if (!tableInfo[col.name]) {
                console.log(`Adding column: ${col.name}`);
                await queryInterface.addColumn('costSavings', col.name, {
                    type: col.type,
                    allowNull: col.allowNull
                });
                console.log(`✅ Column ${col.name} added successfully.`);
            } else {
                console.log(`ℹ️ Column ${col.name} already exists.`);
            }
        }
    } catch (error) {
        console.error("❌ Error fixing schema:", error.message);
    } finally {
        await db.sequelize.close();
    }
}

fixSchema();
