const { Op, Sequelize } = require("sequelize");
const db = require("../../../config/config");
const { getProjectSnapshot } = require("../../utils/stats_utility");
const moment = require("moment");

/**
 * Advanced Chatbot Handler using Regex-based intent parsing
 * and a comprehensive project data snapshot.
 */
const chatHandler = async (req, res) => {
    try {
        const { human_message } = req.body;
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';

        if (!human_message) {
            return res.status(400).json({ status: false, message: "Message is required" });
        }

        const lowerMessage = human_message.toLowerCase();
        const whereClause = isSuperAdmin ? {} : { userId };

        // 1. Fetch current project snapshot
        const snapshot = await getProjectSnapshot(whereClause);
        if (!snapshot) {
            return res.status(500).json({ status: false, message: "Failed to gather database statistics." });
        }

        let responseText = "";

        // =====================================================
        // INTENT DETECTION LOGIC (Regex Patterns)
        // =====================================================

        // GREETINGS
        if (lowerMessage.match(/^(hi|hello|hey|greetings|sasriyakaal|namaste)/i)) {
            responseText = `Hello! I am your ProcXa AI Assistant. I have analyzed all your modules. 
            \nAap mujhse kisi bhi menu item ke baare mein puch sakte hain (Intake, Contracts, Spend, Suppliers, etc.).
            \nTry asking: "Project status batao" ya "Kitne approval pending hain?".`;
        }

        // 1. INTAKE MANAGEMENT
        else if (lowerMessage.match(/(intake|request|requisition)/i)) {
            if (lowerMessage.match(/(approved|pass|clear)/i)) {
                responseText = `Aapke paas total **${snapshot.intake.approved} approved** intake requests hain.`;
            } else if (lowerMessage.match(/(pending|wait|open)/i)) {
                responseText = `Abhi **${snapshot.intake.pending} requests pending** hain approval ke liye.`;
            } else if (lowerMessage.match(/(rejected|cancel)/i)) {
                responseText = `System mein **${snapshot.intake.rejected} rejected** requests hain.`;
            } else {
                responseText = `Intake Status: Total **${snapshot.intake.total}** requests hain. 
                \n- Pending: ${snapshot.intake.pending}
                \n- Approved: ${snapshot.intake.approved}
                \n- Active: ${snapshot.intake.active}`;
            }
        }

        // 2. CONTRACT MANAGEMENT & RENEWAL MANAGEMENT
        else if (lowerMessage.match(/(contract|agreement|renewal|renew)/i)) {
            if (lowerMessage.match(/(expir|end|finish|khata?m)/i)) {
                responseText = `Warning: Aapke **${snapshot.contracts.expiringSoon} contracts** agle 30 dino mein expire hone wale hain. 
                \nRenewal table mein **${snapshot.renewals.total}** records managed hain.`;
            } else if (lowerMessage.match(/(active|chalu)/i)) {
                responseText = `Aapke paas total **${snapshot.contracts.active} active contracts** hain.`;
            } else {
                responseText = `Contract & Renewal Detail:
                \n- Total Contracts: ${snapshot.contracts.total}
                \n- Active: ${snapshot.contracts.active}
                \n- Renewals Tracked: ${snapshot.renewals.total}`;
            }
        }

        // 3. APPROVAL WORKFLOW
        else if (lowerMessage.match(/(approval|workflow|approver)/i)) {
            responseText = `Approval Workflow Status:
            \nAbhi total **${snapshot.approvals.pending} approval requests pending** hain jo aapke review ka intezaar kar rahe hain.`;
        }

        // 4. COST SAVING OPPORTUNITIES
        else if (lowerMessage.match(/(saving|discount|fayda|cost)/i)) {
            const formattedSavings = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(snapshot.savings.total);
            responseText = `Cost Saving Status: Aapne total **${formattedSavings}** ki potential savings identify ki hain.`;
        }

        // 5. SUPPLIER PERFORMANCE
        else if (lowerMessage.match(/(supplier|vendor|performance|rating)/i)) {
            responseText = `Supplier Overview: Aapke system mein total **${snapshot.suppliers.total} registered suppliers** hain. Aap unki performance details 'Supplier Performance' menu mein dekh sakte hain.`;
        }

        // 6. SPEND ANALYTICS
        else if (lowerMessage.match(/(spend|transaction|amount|kharcha|paisa)/i)) {
            const formattedSpend = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(snapshot.spend.total);
            responseText = `Spend Analytics: Aapka total spend **${formattedSpend}** hua hai across **${snapshot.spend.transactions} transactions**.`;
        }

        // 7. LICENSE OVERVIEW & THIRD-PARTY LICENSES
        else if (lowerMessage.match(/(license|subscription|key|third party)/i)) {
            responseText = `License Management:
            \n- Internal Licenses: ${snapshot.licenses.total}
            \n- Third-Party/Client Licenses: ${snapshot.licenses.thirdParty}`;
        }

        // 8. INVENTORY
        else if (lowerMessage.match(/(inventory|stock|item|maal)/i)) {
            responseText = `Inventory Status: Total **${snapshot.inventory.total}** items hain. jinmein se **${snapshot.inventory.lowStock} items low stock** par hain.`;
        }

        // 9. CONTRACT TEMPLATES
        else if (lowerMessage.match(/(template|draft)/i)) {
            responseText = `Templates: Aapke paas total **${snapshot.templates.total} contract templates** available hain naye contracts banane ke liye.`;
        }

        // 10. DEPARTMENT MANAGEMENT
        else if (lowerMessage.match(/(department|dept|team)/i)) {
            responseText = `Departments: System mein total **${snapshot.departments.total} departments** configured hain.`;
        }

        // 11. GENERAL SUMMARY / "PROJECT KAISE CHAL RAHA HAI" / DASHBOARD
        else if (lowerMessage.match(/(summary|status|report|analytics|dashboard|kya chal raha hai)/i)) {
            responseText = `Yahan aapke poore project ka complete snapshot hai:
            \n📋 **Intake**: ${snapshot.intake.total} Requests (${snapshot.intake.pending} Pending)
            \n📜 **Contracts**: ${snapshot.contracts.total} Total (${snapshot.contracts.active} Active)
            \n⚖️ **Approvals**: ${snapshot.approvals.pending} Pending
            \n💰 **Spend**: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(snapshot.spend.total)}
            \n💸 **Savings**: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(snapshot.savings.total)}
            \n🏭 **Suppliers**: ${snapshot.suppliers.total} Vendors
            \n🔑 **Licenses**: ${snapshot.licenses.total + snapshot.licenses.thirdParty} Total
            \n📦 **Inventory**: ${snapshot.inventory.total} items`;
        }

        // FALLBACK
        else {
            responseText = `Main har menu ka data bata sakta hoon. Aap kisi specific cheez ke baare mein puchiye, jaise "Active Contracts kitne hain?" ya "Inventory status batao".`;
        }

        // Return the response
        return res.status(200).json({
            status: true,
            response: responseText
        });

    } catch (error) {
        console.error("Chatbot Error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

module.exports = {
    chatHandler
};
