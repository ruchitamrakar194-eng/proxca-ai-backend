// models/CostSaving.js
module.exports = (sequelize, DataTypes) => {
    const costSaving = sequelize.define('costSaving', {
        // Basic form fields
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },

        supplierName: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        requesterName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        departmentId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        group: {
            type: DataTypes.STRING,
            allowNull: true
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reportingYear: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        benefitStartMonth: {
            type: DataTypes.STRING,
            allowNull: false
        },
        benefitEndMonth: {
            type: DataTypes.STRING,
            allowNull: true
        },
        typeOfCostSaving: {
            type: DataTypes.STRING,
            allowNull: false
        },
        historicalUnitPrice: {
            type: DataTypes.STRING,
            allowNull: true
        },
        negotiatedUnitPrice: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reductionPerUnit: {
            type: DataTypes.STRING,
            allowNull: true
        },
        currentPrice: {
            type: DataTypes.STRING,
            allowNull: true
        },
        proposedPrice: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notesDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        },
 
        // Forecasted Volumes (store as JSON)
        forecastVolumes: {
            type: DataTypes.JSON,
            allowNull: true
        },
 
        // Sourcing Benefits (store as JSON)
        sourcingBenefits: {
            type: DataTypes.JSON,
            allowNull: true
        },
        intakeRequest: {
            type: DataTypes.BIGINT,

        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        historicalUnitPrices: {
            type: DataTypes.JSON,
            allowNull: true
        },
        forecastVolumesMultiYear: {
            type: DataTypes.JSON,
            allowNull: true
        },
        additionalColumns: {
            type: DataTypes.JSON,
            allowNull: true
        }
    });

    return costSaving;
};
