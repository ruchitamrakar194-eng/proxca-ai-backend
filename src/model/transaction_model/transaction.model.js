module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define('transaction', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    dateOfTransaction: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    supplierId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING,

    },
    quarter: {
      type: DataTypes.STRING,

    },
    unit:{
      type: DataTypes.FLOAT,

    },
    userId: {
      type: DataTypes.BIGINT,
    }
  });

  return transaction;
};
