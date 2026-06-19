const db = require('./config/config');
const q = `SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
           FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
           WHERE TABLE_NAME = 'intake_request_approvers' 
           AND REFERENCED_TABLE_NAME IS NOT NULL`;

db.sequelize.query(q).then(([results]) => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
