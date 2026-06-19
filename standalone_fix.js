const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'procxa-new',
    process.env.DB_USERNAME || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: console.log
    }
);

async function fix() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        
        console.log("Checking columns in costSavings...");
        const tableInfo = await queryInterface.describeTable('costSavings');
        
        const columnsToAdd = [
            { name: 'requesterName', type: DataTypes.STRING },
            { name: 'departmentId', type: DataTypes.BIGINT },
            { name: 'group', type: DataTypes.STRING },
            { name: 'intakeRequest', type: DataTypes.BIGINT }
        ];

        for (const col of columnsToAdd) {
            if (!tableInfo[col.name]) {
                console.log(`Adding column: ${col.name}`);
                await queryInterface.addColumn('costSavings', col.name, {
                    type: col.type,
                    allowNull: true
                });
                console.log(`✅ Column ${col.name} added.`);
            } else {
                console.log(`ℹ️ Column ${col.name} already exists.`);
            }
        }

        if (tableInfo['depreciationScheduleYears']) {
            console.log("Removing column: depreciationScheduleYears");
            await queryInterface.removeColumn('costSavings', 'depreciationScheduleYears');
            console.log("✅ Column depreciationScheduleYears removed.");
        }

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

fix();
