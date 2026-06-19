module.exports = (sequelize, DataTypes) => {
  const contract_preference = sequelize.define('contract_preference', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    intakeRequestId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    emailRecipients: {
      type: DataTypes.TEXT, // Comma-separated emails
      allowNull: false
    },
    reminderDays: {
      type: DataTypes.JSON, // [30, 60, 90]
      allowNull: false
    },
    lastNotifiedDays: {
      type: DataTypes.JSON, // [30] if 30-day reminder was sent
      defaultValue: []
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    emailBody: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emailSubject: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'contract_preferences',
    timestamps: true
  });

  return contract_preference;
};
