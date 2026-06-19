require('dotenv').config();
const db = require('./config/config');
const Contract = db.contract;
const moment = require('moment');

async function updateContract() {
    try {
        const nextMonth = moment().add(1, 'month').toDate();
        await Contract.update({ endDate: nextMonth }, { where: { id: 1 } });
        console.log('Contract 1 updated to expire in:', nextMonth);
    } catch (err) {
        console.error('Error:', err);
    }
}

updateContract();
