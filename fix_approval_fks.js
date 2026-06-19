const db = require('./config/config');

async function fixApprovalConstraints() {
  try {
    // 1. Find all foreign keys on the userId column
    const [constraints] = await db.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'intake_request_approvers' 
      AND COLUMN_NAME = 'userId' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (constraints.length === 0) {
      console.log('No foreign key constraints found on intake_request_approvers.userId');
    } else {
      for (const row of constraints) {
        const constraint = row.CONSTRAINT_NAME;
        console.log(`Dropping constraint: ${constraint}...`);
        try {
          await db.sequelize.query(`ALTER TABLE intake_request_approvers DROP FOREIGN KEY \`${constraint}\``);
          console.log(`Successfully dropped ${constraint}`);
        } catch (err) {
          console.error(`Failed to drop ${constraint}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error("Error in fixApprovalConstraints:", error.message);
  }

  console.log('Finished dropping invalid constraints on intake_request_approvers.userId');
  process.exit(0);
}

fixApprovalConstraints();
