const db = require('./config/config');

async function checkAllConstraints() {
  const q = `SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
             WHERE TABLE_NAME IN ('intake_request_approvers', 'procurement_request_approvers')
             AND REFERENCED_TABLE_NAME IS NOT NULL`;

  try {
    const [results] = await db.sequelize.query(q);
    console.log(JSON.stringify(results, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

checkAllConstraints();
