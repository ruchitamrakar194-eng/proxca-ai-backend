module.exports = (sequelize, DataTypes) => {
    const supplier_performance = sequelize.define("supplier_performance", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        supplierId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        deliveryScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        qualityScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        costScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        complianceScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        supportScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }
    });

    return supplier_performance;
};
