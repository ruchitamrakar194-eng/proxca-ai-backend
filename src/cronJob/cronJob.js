require('dotenv').config();
const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require("../../config/config");
const { sendEmail } = require('../utils/mailService');
const recipientEmail = process.env.RECIPIENT_EMAIL;

const sendRenewalNotifications = async () => {
    try {
        console.log('Running automated renewal notification job...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch all customized notification preferences
        const preferences = await db.contract_preference.findAll({
            where: { status: true },
            include: [{
                model: db.intake_request,
                as: 'intakeDetails',
                attributes: ['id', 'supplierName', 'endDate']
            }]
        });

        for (const pref of preferences) {
            const contract = pref.intakeDetails;
            if (!contract || !contract.endDate) continue;

            const expiryDate = new Date(contract.endDate);
            expiryDate.setHours(0, 0, 0, 0);

            // Calculate diff in days
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const reminderSchedule = typeof pref.reminderDays === 'string' 
                ? JSON.parse(pref.reminderDays) 
                : pref.reminderDays;

            const alreadyNotified = typeof pref.lastNotifiedDays === 'string'
                ? JSON.parse(pref.lastNotifiedDays || '[]')
                : (pref.lastNotifiedDays || []);

            // Check if today matches any scheduled reminder day
            if (reminderSchedule.includes(diffDays) && !alreadyNotified.includes(diffDays)) {
                
                const supplierName = contract.supplierName || "N/A";
                const intakeID = contract.id;
                const formattedExpiry = expiryDate.toISOString().split('T')[0];
                const recipients = pref.emailRecipients || recipientEmail;

                // Use custom subject if available, otherwise use default
                let emailSubject = pref.emailSubject || `Renewal Alert: ${diffDays} Days Remaining for ${supplierName}`;
                
                // Use custom body if available, otherwise use default
                let body = pref.emailBody || "Renewal Alert: The contract for {{Supplier}} is expiring on {{ExpiryDate}}. Action required within {{Days}} days.";

                // Dynamic variable replacement for subject and body
                const replacements = {
                    "{{Supplier}}": supplierName,
                    "{{ExpiryDate}}": formattedExpiry,
                    "{{IntakeID}}": intakeID,
                    "{{Days}}": diffDays
                };

                Object.keys(replacements).forEach(key => {
                    const regex = new RegExp(key, "g");
                    emailSubject = emailSubject.replace(regex, replacements[key]);
                    body = body.replace(regex, replacements[key]);
                });

                const success = await sendEmail(recipients, emailSubject, body);

                if (success) {
                    console.log(`Email sent for contract ${contract.id} (${diffDays} days before expiry) to ${recipients}`);
                    
                    // Track that we notified for this day to avoid duplicate sends
                    const updatedNotified = [...alreadyNotified, diffDays];
                    await pref.update({ lastNotifiedDays: updatedNotified });
                }
            }
        }
    } catch (error) {
        console.error('Error sending renewal notifications:', error);
    }
};

// Schedule the cron job to run daily at 9:00 AM
cron.schedule('0 9 * * *', () => {
    sendRenewalNotifications();
    console.log('Cron job task executed.');
});

module.exports = { sendRenewalNotifications };
