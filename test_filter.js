require('dotenv').config();
const { get_dashboard_data } = require('./src/controller/dashboard_controller/dashboard.controller');

const runTest = async (filterType) => {
    console.log(`\n=== Testing filterType: ${filterType} ===`);
    const req = {
        user: { id: 1, userType: 'superadmin' },
        query: { filterType }
    };

    let resultData = null;
    const res = {
        status: function (code) { return this; },
        json: function (data) { resultData = data; }
    };

    await get_dashboard_data(req, res);
    if (resultData && resultData.status) {
        console.log('Top Suppliers Count:', resultData.topSuppliers?.length);
        console.log('Top Suppliers Data:', JSON.stringify(resultData.topSuppliers, null, 2));
    } else {
        console.log('Error:', resultData?.message);
    }
};

const runAll = async () => {
    await runTest('monthly');
    await runTest('yearly');
};

runAll().catch(console.error);
