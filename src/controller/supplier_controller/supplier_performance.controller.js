const db = require("../../../config/config");

const SupplierPerformance = db.supplier_performance;
const Supplier = db.supplier;

const add_rating = async (req, res) => {
    // userId might come from req.user if authenticated
    try {
        const { supplierId, deliveryScore, qualityScore, costScore, complianceScore, supportScore, totalScore } = req.body;

        if (!supplierId) {
            return res.status(400).json({ status: false, message: "Supplier ID is required" });
        }

        // Check if a record already exists for this supplier
        let performance = await SupplierPerformance.findOne({ where: { supplierId } });

        if (performance) {
            // Update existing record
            await performance.update({
                deliveryScore,
                qualityScore,
                costScore,
                complianceScore,
                supportScore,
                totalScore,
                // userId: req.user ? req.user.id : null // Uncomment if auth is used
            });
            return res.status(200).json({ status: true, message: "Performance updated successfully", data: performance });
        } else {
            // Create new record
            performance = await SupplierPerformance.create({
                supplierId,
                deliveryScore,
                qualityScore,
                costScore,
                complianceScore,
                supportScore,
                totalScore,
                // userId: req.user ? req.user.id : null
            });
            return res.status(201).json({ status: true, message: "Performance added successfully", data: performance });
        }

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

const get_ratings = async (req, res) => {
    try {
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';

        // Filter suppliers based on role: SuperAdmin sees all, Admin sees only their own
        const whereClause = isSuperAdmin ? {} : { userId };

        const performances = await SupplierPerformance.findAll({
            include: [{
                model: Supplier,
                as: "supplier",
                attributes: ['id', 'name'],
                where: whereClause // Apply filtering here
            }]
        });

        // Transform data if needed to match frontend expectation
        // The frontend expects: supplierId, supplierName, scores...
        const formattedData = performances.map(p => ({
            id: p.id,
            supplierId: p.supplierId,
            supplierName: p.supplier ? p.supplier.name : 'Unknown Supplier',
            deliveryScore: p.deliveryScore,
            qualityScore: p.qualityScore,
            costScore: p.costScore,
            complianceScore: p.complianceScore,
            supportScore: p.supportScore,
            totalScore: p.totalScore
        }));

        return res.status(200).json({ status: true, data: formattedData });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

const get_rankings = async (req, res) => {
    try {
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';

        // Filter suppliers based on role
        const whereClause = isSuperAdmin ? {} : { userId };

        const performances = await SupplierPerformance.findAll({
            include: [{
                model: Supplier,
                as: "supplier",
                attributes: ['id', 'name'],
                where: whereClause // Apply filtering here
            }],
            order: [['totalScore', 'DESC']]
        });

        const formattedData = performances.map((p, index) => ({
            rank: index + 1,
            id: p.id,
            supplierId: p.supplierId,
            supplierName: p.supplier ? p.supplier.name : 'Unknown Supplier',
            totalScore: p.totalScore,
            breakdown: {
                delivery: p.deliveryScore,
                quality: p.qualityScore,
                cost: p.costScore,
                compliance: p.complianceScore,
                support: p.supportScore
            }
        }));

        return res.status(200).json({ status: true, data: formattedData });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

const delete_rating = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: false, message: "Rating ID is required" });
        }

        const deleted = await SupplierPerformance.destroy({
            where: { id }
        });

        if (deleted) {
            return res.status(200).json({ status: true, message: "Rating deleted successfully" });
        } else {
            return res.status(404).json({ status: false, message: "Rating not found" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

const update_rating = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryScore, qualityScore, costScore, complianceScore, supportScore, totalScore } = req.body;

        if (!id) {
            return res.status(400).json({ status: false, message: "Rating ID is required" });
        }

        const performance = await SupplierPerformance.findOne({ where: { id } });

        if (!performance) {
            return res.status(404).json({ status: false, message: "Rating not found" });
        }

        await performance.update({
            deliveryScore,
            qualityScore,
            costScore,
            complianceScore,
            supportScore,
            totalScore
        });

        return res.status(200).json({ status: true, message: "Performance updated successfully", data: performance });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {
    add_rating,
    get_ratings,
    get_rankings,
    delete_rating,
    update_rating
};
