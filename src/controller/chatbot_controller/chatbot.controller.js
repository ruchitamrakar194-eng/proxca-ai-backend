const db = require('../../../config/config');
const CostSaving = db.costSaving;
const Transaction = db.transaction;
const { Sequelize } = require('sequelize');

exports.askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const query = message.toLowerCase();
        let response = "I'm sorry, I don't have an answer for that yet. Try asking 'What's the total cost savings?' or 'What's the total spend?'.";

        if (query.includes("cost saving") || query.includes("savings")) {
            const savings = await CostSaving.findAll();
            let totalSavings = 0;
            
            savings.forEach(s => {
                // Logic: currentPrice - proposedPrice
                const current = parseFloat(s.currentPrice) || 0;
                const proposed = parseFloat(s.proposedPrice) || 0;
                totalSavings += (current - proposed);
            });

            response = `The total estimated cost savings across all programs is ${totalSavings.toFixed(2)}.`;
        } 
        else if (query.includes("spend") || query.includes("spending") || query.includes("transaction")) {
            const totalSpend = await Transaction.sum('amount');
            response = `The total spend recorded in the system is ${totalSpend || 0}.`;
        }
        else if (query.includes("hi") || query.includes("hello")) {
            response = "Hello! I'm your ProX AI Assistant. How can I help you with your procurement data today?";
        }

        return res.status(200).json({ reply: response });
    } catch (error) {
        console.error("Chatbot Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
