require('dotenv').config();
const db = require('./config/config');

async function seed() {
  try {
    console.log('Connecting to DB...');
    // Ensure we have at least 3 suppliers to make "Top Vendors" chart look good
    let sups = await db.supplier.findAll({ limit: 3 });
    if (sups.length < 3) {
      console.log('Creating more dummy suppliers...');
      await db.supplier.bulkCreate([
        { name: 'Tech Solutions Inc', contactPerson: 'Alice', email: 'alice@tech.com', phone: '1234567890', address: 'NY' },
        { name: 'Global Supply Co', contactPerson: 'Bob', email: 'bob@global.com', phone: '0987654321', address: 'SF' },
        { name: 'Office Depot', contactPerson: 'Charlie', email: 'charlie@office.com', phone: '1112223333', address: 'TX' }
      ]);
      sups = await db.supplier.findAll({ limit: 3 });
    }

    let cats = await db.category.findAll({ limit: 3 });
    if (cats.length === 0) {
      await db.category.bulkCreate([{ name: 'IT Hardware' }, { name: 'Software Licenses' }, { name: 'Office Supplies' }]);
      cats = await db.category.findAll({ limit: 3 });
    }

    let depts = await db.department.findAll({ limit: 3 });
    let users = await db.user.findAll({ limit: 1 });

    const userId = users[0] ? users[0].id : 1;

    console.log('Creating dummy transactions...');
    const transactions = [];
    const numTransactions = 50;

    // Generate random transactions over the last 6 months
    for (let i = 0; i < numTransactions; i++) {
      const cat = cats[Math.floor(Math.random() * cats.length)];
      const sup = sups[Math.floor(Math.random() * sups.length)];
      const dept = depts[Math.floor(Math.random() * depts.length)];

      // Random date between 6 months ago and today
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
      date.setDate(Math.floor(Math.random() * 28) + 1);

      transactions.push({
        amount: Math.floor(Math.random() * 9000) + 1000, // $1000 to $10000
        dateOfTransaction: date,
        description: `Dummy transaction ${i}`,
        categoryId: cat.id,
        supplierId: sup.id,
        departmentId: dept ? dept.id : null,
        userId: userId,
        status: 'approved'
      });
    }

    await db.transaction.bulkCreate(transactions);
    console.log(`Successfully inserted ${numTransactions} transactions!`);

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit(0);
  }
}

seed();
