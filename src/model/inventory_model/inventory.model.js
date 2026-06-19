module.exports = (sequelize, DataTypes) => {
    const inventory = sequelize.define('inventory', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        item_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        current_stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        threshold_type: {
            type: DataTypes.ENUM('percentage', 'quantity'),
            defaultValue: 'quantity'
        },
        threshold_value: {
            type: DataTypes.FLOAT,
            defaultValue: 10
        },
        last_restock_date: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'inventory_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return inventory;
}
