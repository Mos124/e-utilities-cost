const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'บาท'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'expense_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ExpenseCategory;
