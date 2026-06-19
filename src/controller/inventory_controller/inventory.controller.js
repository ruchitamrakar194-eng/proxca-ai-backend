const db = require("../../../config/config");
const { inventory } = db;

// Create inventory item
exports.createInventoryItem = async (req, res) => {
    try {


        const userId = req.user.id;
        const data = await inventory.create({ ...req.body, userId });
        res.status(201).json({ status: true, data, message: "Inventory item created successfully" });
    } catch (error) {
        console.error("Error creating inventory item:", error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ status: false, message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ status: false, message: error.message });
    }
};

// Get all inventory items
exports.getAllInventoryItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await inventory.findAll({ where: { userId } });
        res.status(200).json({ status: true, data });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Update stock level
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_stock } = req.body;

        const item = await inventory.findByPk(id);
        if (!item) return res.status(404).json({ status: false, message: "Item not found" });

        item.current_stock = current_stock;
        if (req.body.last_restock_date) item.last_restock_date = req.body.last_restock_date;

        await item.save();

        // Check threshold for response message
        let thresholdAlert = false;
        if (item.threshold_type === 'quantity') {
            if (item.current_stock <= item.threshold_value) thresholdAlert = true;
        } else if (item.threshold_type === 'percentage') {
            // This requires knowing 'total/capacity', if not provided, we can skip or assume a base
            // For now, let's just use simple quantity check if no total
        }

        res.status(200).json({
            status: true,
            data: item,
            message: "Stock updated successfully",
            lowStockAlert: thresholdAlert
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
    try {
        // Simplified query for threshold_type = 'quantity'
        const alerts = await inventory.findAll({
            where: {
                current_stock: {
                    [db.Sequelize.Op.lte]: db.sequelize.col('threshold_value')
                },
                threshold_type: 'quantity'
            }
        });
        res.status(200).json({ status: true, data: alerts });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
