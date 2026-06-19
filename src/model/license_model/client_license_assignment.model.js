module.exports = (sequelize, DataTypes) => {
    const client_license_assignment = sequelize.define('client_license_assignment', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        client_license_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        assigned_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'client_license_assignments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return client_license_assignment;
}
