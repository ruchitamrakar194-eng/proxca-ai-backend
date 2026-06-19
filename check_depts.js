const db = require('./config/config');

async function checkDepts() {
  try {
    const depts = await db.department.findAll();
    console.log('--- Departments ---');
    depts.forEach(d => {
      console.log(`ID: ${d.id}, Name: ${d.name}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDepts();
