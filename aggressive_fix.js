const db = require('./config/config');

async function aggressiveFix() {
  const constraints = [
    'intake_request_approvers_ibfk_92',
    'intake_request_approvers_ibfk_10',
    'intake_request_approvers_ibfk_91',
    'intake_request_approvers_ibfk_9'
  ];

  for (const c of constraints) {
    try {
      console.log(`Dropping ${c}...`);
      await db.sequelize.query(`ALTER TABLE intake_request_approvers DROP FOREIGN KEY \`${c}\``);
      console.log(`SUCCESS: ${c} dropped.`);
    } catch (e) {
      console.log(`FAILED: ${c} - ${e.message}`);
    }
  }

  // Also try dropping indexes if they exist with the same name
  for (const c of constraints) {
    try {
      await db.sequelize.query(`ALTER TABLE intake_request_approvers DROP INDEX \`${c}\``);
      console.log(`INDEX SUCCESS: ${c} index dropped.`);
    } catch (e) {
        // Ignore index errors
    }
  }

  process.exit(0);
}

aggressiveFix();
