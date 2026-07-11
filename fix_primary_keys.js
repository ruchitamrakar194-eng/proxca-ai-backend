const db = require('./config/config');

async function fixPrimaryKeys() {
    console.log("🚀 Starting to fix missing primary keys...");
    try {
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = await db.sequelize.query('SHOW TABLES', { raw: true });
        
        for (let i = 0; i < tables[0].length; i++) {
            const tableName = Object.values(tables[0][i])[0];
            
            // Get columns of the table
            const columns = await db.sequelize.query(`SHOW COLUMNS FROM \`${tableName}\``, { raw: true });
            
            // Check if there is an 'id' column and if it's not a primary key
            let hasId = false;
            let isPri = false;
            let isAutoInc = false;
            
            for (const col of columns[0]) {
                if (col.Field === 'id') {
                    hasId = true;
                    if (col.Key === 'PRI') isPri = true;
                    if (col.Extra.includes('auto_increment')) isAutoInc = true;
                }
            }
            
            if (hasId && !isPri) {
                console.log(`🔧 Fixing table: ${tableName}`);
                try {
                    // Add primary key
                    await db.sequelize.query(`ALTER TABLE \`${tableName}\` ADD PRIMARY KEY (id)`);
                    console.log(`   ✅ Added PRIMARY KEY constraint`);
                } catch(e) {
                    console.log(`   ❌ Could not add PRIMARY KEY: ${e.message}`);
                }
            }
            
            if (hasId && !isAutoInc) {
                if(isPri) console.log(`🔧 Fixing auto_increment for table: ${tableName}`);
                try {
                    // Modify to auto_increment
                    await db.sequelize.query(`ALTER TABLE \`${tableName}\` MODIFY id BIGINT(20) AUTO_INCREMENT`);
                    console.log(`   ✅ Added AUTO_INCREMENT`);
                } catch(e) {
                    console.log(`   ❌ Could not add AUTO_INCREMENT: ${e.message}`);
                }
            }
        }
        
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("🎉 All tables fixed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error fixing primary keys:", err);
        process.exit(1);
    }
}

fixPrimaryKeys();
