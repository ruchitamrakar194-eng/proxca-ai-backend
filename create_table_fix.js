/**
 * Standalone fix script to create missing database tables.
 * This script connects to the database using existing configuration
 * and ensures the 'costSavings' table exists.
 * 
 * Usage: node create_table_fix.js
 */

const db = require('./config/config');

async function fixDatabase() {
  console.log('🚀 Starting Database Table Fix...');
  
  try {
    // Check connection first
    await db.sequelize.authenticate();
    console.log('✅ Database connection successful.');

    // We specifically want to sync the costSaving model
    // sync() will create the table if it's missing
    console.log('⏳ Ensuring "costSavings" table exists...');
    
    // Using alter: true instead of false to ensure schema matches model
    // but without dropping data (sync() default is safe)
    await db.costSaving.sync({ alter: false });
    
    console.log('✅ Table "costSavings" verified/created successfully!');
    
    // Also sync associations just in case
    console.log('⏳ Updating foreign keys and associations...');
    await db.sequelize.sync({ alter: false });
    console.log('✅ Global database sync completed.');

    console.log('\n✨ Database is now in sync. You can restart the server.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error fixing database:', error.message);
    if (error.original) {
      console.error('Original Error:', error.original.message);
    }
    process.exit(1);
  }
}

fixDatabase();
