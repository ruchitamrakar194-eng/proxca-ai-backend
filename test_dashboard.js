require('dotenv').config();
const { get_dashboard_data } = require('./src/controller/dashboard_controller/dashboard.controller');

const req = {
    user: {
        id: 1,
        userType: 'superadmin'
    }
};

const res = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log('Response Code:', this.statusCode);
        if (data.status) {
            console.log('Summary:', JSON.stringify(data.summary, null, 2));
            console.log('Monthly Category Data Count:', data.categoryDataMonthly?.length);
            console.log('Yearly Category Data Count:', data.categoryDataYearly?.length);
            console.log('Coming Renewals Count:', data.comingRenewals?.length);
            if (data.comingRenewals?.length > 0) {
                console.log('First Renewal Sample:', JSON.stringify(data.comingRenewals[0], null, 2));
            }
        } else {
            console.log('Error:', data.message);
        }
    }
};

console.log('Testing refined get_dashboard_data...');
get_dashboard_data(req, res).catch(err => {
    console.error('Error during test:', err);
});
