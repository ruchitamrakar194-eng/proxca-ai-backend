const db = require('./config/config');

async function testAssignFlow() {
  const transaction = await db.sequelize.transaction();
  try {
    const intakeRequestId = 35; // From the user image
    const departmentIds = [26]; // IT department ID
    
    console.log(`Resetting flow for request ${intakeRequestId}...`);
    await db.intake_request_approvers.destroy({
      where: { intakeRequestId },
      transaction
    });

    console.log(`Creating new approver entry for dept 26...`);
    const approverEntries = [{
      intakeRequestId,
      userId: 26, 
      status: 'pending',
      userType: 'department'
    }];

    await db.intake_request_approvers.bulkCreate(approverEntries, { transaction });
    await transaction.commit();
    console.log("SUCCESS: Flow assigned successfully.");
  } catch (error) {
    await transaction.rollback();
    console.error("FAILURE: Error assigning flow:", error.message);
    if (error.parent) {
        console.error("SQL Error:", error.parent.sql);
        console.error("SQL Message:", error.parent.message);
    }
  }
  process.exit(0);
}

testAssignFlow();
