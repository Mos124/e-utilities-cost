const { BudgetCategory } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const categories = await BudgetCategory.findAll({
      order: [['id', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, code, is_active } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อและรหัสหมวดเงิน' });
    }

    const existing = await BudgetCategory.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'รหัสหมวดเงินนี้มีอยู่แล้ว' });
    }

    const category = await BudgetCategory.create({
      name,
      code,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, is_active } = req.body;

    const category = await BudgetCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลหมวดเงิน' });
    }

    if (code && code !== category.code) {
      const existing = await BudgetCategory.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({ message: 'รหัสหมวดเงินนี้มีอยู่แล้ว' });
      }
    }

    await category.update({
      name: name || category.name,
      code: code || category.code,
      is_active: is_active !== undefined ? is_active : category.is_active
    });

    res.json(category);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await BudgetCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลหมวดเงิน' });
    }

    await category.destroy();
    res.json({ message: 'ลบหมวดเงินเรียบร้อยแล้ว' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
