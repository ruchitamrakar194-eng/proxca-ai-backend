require('dotenv').config();
const db = require('./config/config');
const Transaction = db.transaction;

async function checkTransactions() {
    try {
        const transactions = await Transaction.findAll({
            attributes: ['id', 'dateOfTransaction', 'amount'],
            raw: true
        });
        console.log('All Transactions:', JSON.stringify(transactions, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

checkTransactions();
