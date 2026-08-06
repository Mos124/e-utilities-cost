const sequelize = require('../config/db');
const User = require('./user.model');
const ExpenseCategory = require('./expenseCategory.model');
const BudgetCategory = require('./budgetCategory.model');
const Expense = require('./expense.model');

// Relationships
Expense.belongsTo(ExpenseCategory, { foreignKey: 'expense_category_id', as: 'expenseCategory' });
ExpenseCategory.hasMany(Expense, { foreignKey: 'expense_category_id' });

Expense.belongsTo(BudgetCategory, { foreignKey: 'budget_category_id', as: 'budgetCategory' });
BudgetCategory.hasMany(Expense, { foreignKey: 'budget_category_id' });

Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Expense, { foreignKey: 'created_by' });

module.exports = {
  sequelize,
  User,
  ExpenseCategory,
  BudgetCategory,
  Expense
};
