const db = require('./config/config');

async function testValidation() {
    try {
        console.log("Authenticating...");
        await db.sequelize.authenticate();
        console.log("Connected. Testing validation...");

        const user = await db.user.findOne();
        if (!user) {
            console.error("No user found!");
            process.exit(1);
        }

        const testItem = {
            sku: "002", // The SKU from the screenshot
            item_name: "nnn",
            current_stock: 100,
            threshold_value: 10,
            threshold_type: 'percentage', // Lowercase as per frontend value
            userId: user.id
        };

        console.log("Attempting to create:", testItem);
        const item = await db.inventory.create(testItem);
        console.log("Success! Created item:", item.toJSON());

        // Clean up
        await item.destroy();

    } catch (error) {
        console.error("Validation Error Caught:");
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            error.errors.forEach(e => {
                console.error(`- Field: ${e.path}, Message: ${e.message}, Value: ${e.value}`);
            });
        } else {
            console.error(error);
        }
    } finally {
        process.exit(0);
    }
}

testValidation();
