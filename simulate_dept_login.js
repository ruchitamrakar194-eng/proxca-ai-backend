const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const access_secret_key = process.env.ACCESS_SECRET_KEY;

async function test() {
  // Simulate token for Sales Department (ID 23)
  const payload = {
    id: 23,
    email: 'sales@example.com',
    type: 'department'
  };
  
  const token = jwt.sign(payload, access_secret_key, { expiresIn: '1h' });
  
  console.log("Simulating request for Dept 23 with token...");
  
  try {
    const response = await axios.get('http://localhost:3000/procxa/get_all_not_pending_intake_requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log("ERROR Response:", error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("ERROR:", error.message);
    }
  }
}

test();
