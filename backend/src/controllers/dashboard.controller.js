const { Expense, ExpenseCategory, BudgetCategory, sequelize } = require('../models');
const { Op } = require('sequelize');

const getSummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Get all expenses for the target year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const yearExpenses = await Expense.findAll({
      where: {
        billing_month: { [Op.between]: [startDate, endDate] }
      },
      include: [
        { model: ExpenseCategory, as: 'expenseCategory', attributes: ['name', 'code'] },
        { model: BudgetCategory, as: 'budgetCategory', attributes: ['name', 'code'] }
      ]
    });

    // 12 Months Summary Array
    const monthlyTotal = Array(12).fill(0);
    let yearTotal = 0;

    yearExpenses.forEach(exp => {
      const amt = parseFloat(exp.amount) || 0;
      yearTotal += amt;
      const m = new Date(exp.billing_month).getMonth(); // 0-11
      if (m >= 0 && m < 12) {
        monthlyTotal[m] += amt;
      }
    });

    // Current Month & Previous Month
    const currentMonthTotal = monthlyTotal[currentMonth - 1] || 0;
    const prevMonthTotal = currentMonth === 1 ? 0 : (monthlyTotal[currentMonth - 2] || 0);

    let percentChange = 0;
    if (prevMonthTotal > 0) {
      percentChange = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    }

    res.json({
      year,
      yearTotal,
      currentMonth,
      currentMonthTotal,
      prevMonthTotal,
      percentChange: parseFloat(percentChange.toFixed(2)),
      monthlyData: monthlyTotal
    });
  } catch (err) {
    next(err);
  }
};

const getByCategory = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const categories = await ExpenseCategory.findAll();
    const expenses = await Expense.findAll({
      where: {
        billing_month: { [Op.between]: [startDate, endDate] }
      }
    });

    const categorySummary = categories.map(cat => {
      const catExpenses = expenses.filter(e => e.expense_category_id === cat.id);
      const totalAmount = catExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      return {
        id: cat.id,
        name: cat.name,
        code: cat.code,
        unit: cat.unit,
        totalAmount
      };
    });

    res.json(categorySummary);
  } catch (err) {
    next(err);
  }
};

const getByBudget = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const budgets = await BudgetCategory.findAll();
    const expenses = await Expense.findAll({
      where: {
        billing_month: { [Op.between]: [startDate, endDate] }
      }
    });

    const budgetSummary = budgets.map(b => {
      const bExpenses = expenses.filter(e => e.budget_category_id === b.id);
      const totalAmount = bExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      
      // Monthly breakdown per budget
      const monthly = Array(12).fill(0);
      bExpenses.forEach(e => {
        const m = new Date(e.billing_month).getMonth();
        if (m >= 0 && m < 12) {
          monthly[m] += parseFloat(e.amount || 0);
        }
      });

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        totalAmount,
        monthly
      };
    });

    res.json(budgetSummary);
  } catch (err) {
    next(err);
  }
};

const compareYears = async (req, res, next) => {
  try {
    const year1 = parseInt(req.query.year1) || (new Date().getFullYear() - 1);
    const year2 = parseInt(req.query.year2) || new Date().getFullYear();

    const fetchYearData = async (yr) => {
      const startDate = `${yr}-01-01`;
      const endDate = `${yr}-12-31`;
      const expenses = await Expense.findAll({
        where: { billing_month: { [Op.between]: [startDate, endDate] } }
      });
      const monthly = Array(12).fill(0);
      let total = 0;
      expenses.forEach(e => {
        const amt = parseFloat(e.amount || 0);
        total += amt;
        const m = new Date(e.billing_month).getMonth();
        if (m >= 0 && m < 12) monthly[m] += amt;
      });
      return { year: yr, total, monthly };
    };

    const dataYear1 = await fetchYearData(year1);
    const dataYear2 = await fetchYearData(year2);

    res.json({
      year1: dataYear1,
      year2: dataYear2
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getByCategory,
  getByBudget,
  compareYears
};
