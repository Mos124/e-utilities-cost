const { Expense, ExpenseCategory, BudgetCategory, User } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { month, year, expense_category_id, budget_category_id, search, limit = 50, page = 1 } = req.query;
    
    const where = {};

    if (year && month) {
      const monthStr = parseInt(month) < 10 ? `0${parseInt(month)}` : `${parseInt(month)}`;
      const startDate = `${year}-${monthStr}-01`;
      const endDate = `${year}-${monthStr}-31`;
      where.billing_month = { [Op.between]: [startDate, endDate] };
    } else if (year) {
      where.billing_month = { [Op.between]: [`${year}-01-01`, `${year}-12-31`] };
    }

    if (expense_category_id) {
      where.expense_category_id = expense_category_id;
    }

    if (budget_category_id) {
      where.budget_category_id = budget_category_id;
    }

    if (search) {
      where[Op.or] = [
        { invoice_no: { [Op.like]: `%${search}%` } },
        { note: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Expense.findAndCountAll({
      where,
      include: [
        { model: ExpenseCategory, as: 'expenseCategory', attributes: ['id', 'name', 'code', 'unit'] },
        { model: BudgetCategory, as: 'budgetCategory', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] }
      ],
      order: [['billing_month', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id, {
      include: [
        { model: ExpenseCategory, as: 'expenseCategory' },
        { model: BudgetCategory, as: 'budgetCategory' },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] }
      ]
    });

    if (!expense) {
      return res.status(404).json({ message: 'ไม่พบรายการค่าใช้จ่าย' });
    }

    res.json(expense);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { expense_category_id, budget_category_id, amount, billing_month, paid_date, invoice_no, note, attachment_path } = req.body;

    if (!expense_category_id || !budget_category_id || !amount || !billing_month) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ประเภทค่าใช้จ่าย, หมวดเงิน, ยอดเงิน, เดือนที่เบิก)' });
    }

    // Format billing_month to YYYY-MM-01
    const monthDate = new Date(billing_month);
    const yr = monthDate.getFullYear();
    const mo = String(monthDate.getMonth() + 1).padStart(2, '0');
    const formattedBillingMonth = `${yr}-${mo}-01`;

    const expense = await Expense.create({
      expense_category_id,
      budget_category_id,
      amount,
      billing_month: formattedBillingMonth,
      paid_date: paid_date || null,
      invoice_no: invoice_no || null,
      note: note || null,
      attachment_path: attachment_path || null,
      created_by: req.user.id
    });

    const createdWithRelations = await Expense.findByPk(expense.id, {
      include: [
        { model: ExpenseCategory, as: 'expenseCategory' },
        { model: BudgetCategory, as: 'budgetCategory' }
      ]
    });

    res.status(201).json(createdWithRelations);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expense_category_id, budget_category_id, amount, billing_month, paid_date, invoice_no, note, attachment_path } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'ไม่พบรายการค่าใช้จ่าย' });
    }

    let formattedBillingMonth = expense.billing_month;
    if (billing_month) {
      const monthDate = new Date(billing_month);
      const yr = monthDate.getFullYear();
      const mo = String(monthDate.getMonth() + 1).padStart(2, '0');
      formattedBillingMonth = `${yr}-${mo}-01`;
    }

    await expense.update({
      expense_category_id: expense_category_id || expense.expense_category_id,
      budget_category_id: budget_category_id || expense.budget_category_id,
      amount: amount !== undefined ? amount : expense.amount,
      billing_month: formattedBillingMonth,
      paid_date: paid_date !== undefined ? paid_date : expense.paid_date,
      invoice_no: invoice_no !== undefined ? invoice_no : expense.invoice_no,
      note: note !== undefined ? note : expense.note,
      attachment_path: attachment_path !== undefined ? attachment_path : expense.attachment_path
    });

    const updatedWithRelations = await Expense.findByPk(id, {
      include: [
        { model: ExpenseCategory, as: 'expenseCategory' },
        { model: BudgetCategory, as: 'budgetCategory' }
      ]
    });

    res.json(updatedWithRelations);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'ไม่พบรายการค่าใช้จ่าย' });
    }

    await expense.destroy();
    res.json({ message: 'ลบรายการค่าใช้จ่ายเรียบร้อยแล้ว' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
