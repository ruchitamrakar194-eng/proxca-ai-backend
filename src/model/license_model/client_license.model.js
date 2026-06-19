module.exports = (sequelize, DataTypes) => {
    const client_license = sequelize.define('client_license', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        license_name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'e.g., Zoom, Adobe, Salesforce'
        },
        department_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        total_licenses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        used_licenses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'expired', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        tableName: 'client_licenses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return client_license;
}
