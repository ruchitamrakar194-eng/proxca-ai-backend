require('dotenv').config();
const db = require('./config/config');
const Transaction = db.transaction;
const moment = require('moment');

async function updateTransaction() {
    try {
        const thisMonth = moment().toDate();
        await Transaction.update({ dateOfTransaction: thisMonth }, { where: { id: 1 } });
        console.log('Transaction 1 updated to date:', thisMonth);
    } catch (err) {
        console.error('Error:', err);
    }
}

updateTransaction();
