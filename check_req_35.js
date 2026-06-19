const db = require('./config/config');

async function checkRequest() {
  const requestId = 35;
  try {
    const request = await db.intake_request.findByPk(requestId);
    console.log('--- Intake Request ---');
    console.log('ID:', request.id);
    console.log('Contract Template ID:', request.assigncontractTemplateId);
    console.log('Status:', request.status);

    const approvers = await db.intake_request_approvers.findAll({
      where: { intakeRequestId: requestId }
    });
    console.log('\n--- Approvers ---');
    approvers.forEach(a => {
      console.log(`DeptID: ${a.userId}, Status: ${a.status}, Order: ${a.order}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRequest();
