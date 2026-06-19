require('dotenv').config();
const db = require('./config/config'); // Corrected path
const Contract = db.contract;

async function checkContracts() {
    try {
        const contracts = await Contract.findAll({
            attributes: ['id', 'endDate'],
            raw: true
        });
        console.log('All Contracts:', JSON.stringify(contracts, null, 2));

        const count = await Contract.count();
        console.log('Total Contracts:', count);
    } catch (err) {
        console.error('Error:', err);
    }
}

checkContracts();
