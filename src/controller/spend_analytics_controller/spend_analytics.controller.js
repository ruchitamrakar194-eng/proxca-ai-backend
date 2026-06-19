const { Op, Sequelize } = require("sequelize");
const db = require('../../../config/config');
const Transaction = db.transaction;
const category = db.category;
const supplier = db.supplier;
const department = db.department;
const get_spends_details = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';

        // Build where clause for Admin users (filter by userId)
        const adminWhereClause = isSuperAdmin ? {} : { userId: userId };

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 7;
        const offset = (page - 1) * limit;

        // Extract search filters from query params - now using IDs
        const { supplierId, transactionDate, categoryId, departmentId } = req.query;

        // Define the where clause for filtering
        const whereClause = {
            ...adminWhereClause
        };

        // Apply ID-based filters directly in where clause
        if (supplierId) {
            whereClause.supplierId = supplierId;
        }
        if (departmentId) {
            whereClause.departmentId = departmentId;
        }
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        if (transactionDate) {
            whereClause.dateOfTransaction = transactionDate;
        }

        // Include clauses for related data (always include for display)
        const includeClause = [
            {
                model: department,
                as: "department",
                attributes: ['id', 'name'],
            },
            {
                model: supplier,
                as: "supplier",
                attributes: ['id', 'name'],
            },
            {
                model: category,
                as: "category",
                attributes: ['id', 'name'],
            }
        ];

        // Fetch paginated transactions with filters
        const { rows: transactions, count: totalRecords } = await Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: includeClause
        });

        // Calculate summary from full filtered dataset (not paginated)
        const summaryWhereClause = { ...whereClause };

        // Get total transaction count
        const totalSpendCount = await Transaction.count({
            where: summaryWhereClause
        });

        // Get total transaction amount from full filtered dataset
        const totalAmountResult = await Transaction.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
            ],
            where: summaryWhereClause,
            raw: true
        });
        const totalTransactionAmount = parseFloat(totalAmountResult[0]?.totalAmount || 0);

        // Get unique vendor count from full filtered dataset
        const uniqueVendorsResult = await Transaction.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('supplierId'))), 'uniqueVendors']
            ],
            where: summaryWhereClause,
            raw: true
        });
        const totalVendorCount = parseInt(uniqueVendorsResult[0]?.uniqueVendors || 0);

        const totalPages = Math.ceil(totalRecords / limit);

        // Always return 200 OK, even for empty results
        return res.status(200).json({
            status: true,
            message: transactions.length > 0 ? 'Transactions fetched successfully' : 'No transactions found',
            data: transactions,
            summary: {
                totalSpendCount,
                totalTransactionAmount,
                totalVendorCount
            },
            pagination: {
                currentPage: page,
                totalPages: totalPages || 1,
                totalRecords,
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



const get_dashboard_spends_analytics = async (req, res) => {
    try {
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';

        const adminWhereClause = isSuperAdmin ? {} : { userId: userId };

        // 1. Summary Stats
        const totalSpendCount = await Transaction.count({ where: adminWhereClause });
        const totalAmountResult = await Transaction.findAll({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']],
            where: adminWhereClause,
            raw: true
        });
        const totalSpendAmount = parseFloat(totalAmountResult[0]?.totalAmount || 0);

        // 2. Spend by Category
        const byCategory = await Transaction.findAll({
            attributes: [
                'categoryId',
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalSpend'],
                [Sequelize.col('category.name'), 'name']
            ],
            include: [{ model: category, as: 'category', attributes: [] }],
            where: adminWhereClause,
            group: ['categoryId', 'category.name'],
            order: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'DESC']],
            raw: true
        });

        // 3. Spend by Department
        const byDepartment = await Transaction.findAll({
            attributes: [
                'departmentId',
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalSpend'],
                [Sequelize.col('department.name'), 'name']
            ],
            include: [{ model: department, as: 'department', attributes: [] }],
            where: adminWhereClause,
            group: ['departmentId', 'department.name'],
            order: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'DESC']],
            raw: true
        });

        // 4. Spend by Supplier
        const bySupplier = await Transaction.findAll({
            attributes: [
                'supplierId',
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalSpend'],
                [Sequelize.col('supplier.name'), 'name']
            ],
            include: [{ model: supplier, as: 'supplier', attributes: [] }],
            where: adminWhereClause,
            group: ['supplierId', 'supplier.name'],
            order: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'DESC']],
            raw: true
        });

        // 5. This Month's Spend
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthSpendResult = await Transaction.findAll({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']],
            where: {
                ...adminWhereClause,
                dateOfTransaction: { [Op.gte]: startOfMonth }
            },
            raw: true
        });
        const spendThisMonth = parseFloat(monthSpendResult[0]?.totalAmount || 0);

        return res.status(200).json({
            status: true,
            message: "Dashboard analytics fetched successfully",
            byCategory,
            byDepartment,
            bySupplier,
            summary: {
                totalSpendCount,
                totalSpend: totalSpendAmount,
                spendThisMonth,
                spendThisYear: totalSpendAmount, // Simplified for now
                topCategory: byCategory[0]?.name || 'N/A',
                topDepartment: byDepartment[0]?.name || 'N/A',
                topSupplier: bySupplier[0]?.name || 'N/A'
            }
        });
    } catch (error) {
        console.error("Dashboard analytics error:", error);
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    get_spends_details,
    get_dashboard_spends_analytics
};
