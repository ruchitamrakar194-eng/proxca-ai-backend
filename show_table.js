const db = require('./config/config');

db.sequelize.query('SHOW CREATE TABLE intake_request_approvers').then(([results]) => {
    console.log(results[0]['Create Table']);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
