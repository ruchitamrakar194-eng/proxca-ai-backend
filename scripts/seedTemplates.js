const db = require("../config/config");
const EmailTemplate = db.email_template;

const defaultTemplates = [
  {
    templateName: "Initial Renewal Warning (90 Days)",
    subject: "Contract Renewal Notice: {{Supplier}} (90 Days Remaining)",
    body: `Hello Team,\n\nThis is a friendly reminder that our contract with {{Supplier}} (Request ID: {{IntakeID}}) is scheduled to expire on {{ExpiryDate}}. \n\nWe have approximately 3 months (90 days) remaining. Please review the service performance and let us know if you wish to proceed with the renewal or formalize a termination notice.\n\nRegards,\nProcurement Team`
  },
  {
    templateName: "Standard Renewal Notice (60 Days)",
    subject: "ACTION REQUIRED: Renewal Process for {{Supplier}} (60 Days Remaining)",
    body: `Hi,\n\nThe contract for {{Supplier}} (ID: {{IntakeID}}) is due for renewal on {{ExpiryDate}}.\n\nWith 60 days remaining, we should now start the formal renewal process. Please provide any updated requirements, scope changes, or budget adjustments required for the next term.\n\nThank you!`,
  },
  {
    templateName: "Urgent Renewal Alert (30 Days)",
    subject: "URGENT: Contract Expiry Alert for {{Supplier}} - Action Needed",
    body: `URGENT NOTICE:\n\nOur agreement with {{Supplier}} expires in exactly 30 days ({{ExpiryDate}}). \n\nFailure to initiate the renewal process soon may result in service disruption or loss of favorable pricing terms. Please respond immediately with your decision to proceed.\n\nContract ID: {{IntakeID}}\nDays left: {{Days}}\nStatus: URGENT`,
  },
  {
    templateName: "Final Notice / Escalation (15 Days)",
    subject: "Final Notice: Service Disruption Risk - {{Supplier}} Contract",
    body: `FINAL WARNING:\n\nThis is a final notice regarding the contract with {{Supplier}} expiring on {{ExpiryDate}}. Only 15 days remain.\n\nWe have not yet received final confirmation for renewal. Please be advised that services may be impacted if the contract is not authorized for renewal by the expiry date.\n\nID: {{IntakeID}}\nTarget Expiry: {{ExpiryDate}}`,
  },
  {
    templateName: "Negotiation Follow-up",
    subject: "Update: Negotiation Status for {{Supplier}}",
    body: `Hello,\n\nWe are currently in active negotiations with {{Supplier}} for the contract expiring on {{ExpiryDate}}.\n\nThis template can be used to notify stakeholders about the progress or to request specific concessions for the new term.\n\nDays remaining: {{Days}}`,
  }
];

const seedTemplates = async () => {
  try {
    console.log("Seeding professional email templates...");
    
    // Check if templates already exist to avoid duplicates
    const count = await EmailTemplate.count();
    if (count > 0) {
      console.log(`Found ${count} existing templates. Skipping seeding to avoid duplicates.`);
      process.exit(0);
    }

    await EmailTemplate.bulkCreate(defaultTemplates);
    console.log("✅ 5 professional templates seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  }
};

seedTemplates();
