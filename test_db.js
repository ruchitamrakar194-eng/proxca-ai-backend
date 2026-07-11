require('dotenv').config();
const db = require('./config/config');
const Transaction = db.transaction;
const Supplier = db.supplier;

const checkDB = async () => {
    const all = await Transaction.findAll({
        attributes: ['id', 'dateOfTransaction', 'amount', 'supplierId'],
        limit: 5,
        raw: true
    });
    console.log('Sample transactions:', all);
    process.exit(0);
};

checkDB().catch(console.error);
