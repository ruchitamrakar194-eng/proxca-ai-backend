const db = require('./config/config');

async function debugRequest(requestId) {
  try {
    const request = await db.intake_request.findOne({
      where: { id: requestId },
      include: [
        {
          model: db.department,
          as: 'department',
        },
        {
          model: db.contract_template,
          as: 'contractTemplate',
        }
      ]
    });
    
    if (!request) {
      console.log(`Request ${requestId} not found.`);
      return;
    }
    
    console.log("--- Intake Request ---");
    console.log(JSON.stringify(request.toJSON(), null, 2));
    
    const approvers = await db.intake_request_approvers.findAll({
      where: { intakeRequestId: requestId },
      include: [{ model: db.user, as: 'user' }]
    });
    
    console.log("--- Approvers ---");
    console.log(JSON.stringify(approvers.map(a => a.toJSON()), null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debugRequest(3);
