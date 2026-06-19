module.exports = (sequelize, DataTypes) => {

  const intake_request = sequelize.define('intake_request', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    requestType: {
      type: DataTypes.STRING,
    },
    categoryId: {
      type: DataTypes.BIGINT,
    },

    engagementType: {
      type: DataTypes.STRING,
    },
    itemDescription: {
      type: DataTypes.TEXT,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    executionTimeline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reasonForEarlierExecution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    serviceDuration: {
      type: DataTypes.STRING, // Example: "6 months, 1 year"
      allowNull: true,
    },
    amendmentType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contractDocument: {
      type: DataTypes.STRING, // Stores file path
      allowNull: true,
    },
    intakeAttachement: {
      type: DataTypes.STRING, // Stores file path
      allowNull: true,
    },
    budgetCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requestedAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    requesterName: {
      type: DataTypes.STRING,
    },
    requesterDepartmentId: {
      type: DataTypes.BIGINT,
    },
    requesterEmail: {
      type: DataTypes.STRING,
    },
    requesterContactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    additionalDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active'),
      defaultValue: 'pending',
    },
    assignStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.BIGINT,
    },
    supplierEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplierContact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assigncontractTemplateId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    involvesCloud: {
      type: DataTypes.BOOLEAN,
      defaultValue: false

    },
    shareCustomerOrEmployeeInfo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false

    },
  });
  return intake_request;
}
