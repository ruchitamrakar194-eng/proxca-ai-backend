const { sequelize } = require('./config/config');

async function fixDatabase() {
  try {
    console.log("Checking columns for costSavings table...");
    
    const tableInfo = await sequelize.query("DESCRIBE costSavings");
    const columns = tableInfo[0].map(col => col.Field);
    
    const missingColumns = [
      { name: 'userId', type: 'BIGINT NULL' },
      { name: 'historicalUnitPrices', type: 'JSON NULL' },
      { name: 'forecastVolumesMultiYear', type: 'JSON NULL' },
      { name: 'additionalColumns', type: 'JSON NULL' },
      { name: 'currentPrice', type: 'VARCHAR(255) NULL' },
      { name: 'proposedPrice', type: 'VARCHAR(255) NULL' },
      { name: 'notesDescription', type: 'TEXT NULL' }
    ];

    for (const col of missingColumns) {
      if (!columns.includes(col.name)) {
        console.log(`Adding ${col.name} column...`);
        await sequelize.query(`ALTER TABLE costSavings ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`${col.name} column already exists.`);
      }
    }

    console.log("Database schema check completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating database:", error);
    process.exit(1);
  }
}

fixDatabase();
