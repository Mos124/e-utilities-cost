const { ExpenseCategory } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const categories = await ExpenseCategory.findAll({
      order: [['id', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, code, unit, is_active } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อและรหัสประเภทค่าใช้จ่าย' });
    }

    const existing = await ExpenseCategory.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'รหัสประเภทค่าใช้จ่ายนี้มีอยู่แล้ว' });
    }

    const category = await ExpenseCategory.create({
      name,
      code,
      unit: unit || 'บาท',
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
    const { name, code, unit, is_active } = req.body;

    const category = await ExpenseCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลประเภทค่าใช้จ่าย' });
    }

    if (code && code !== category.code) {
      const existing = await ExpenseCategory.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({ message: 'รหัสประเภทค่าใช้จ่ายนี้มีอยู่แล้ว' });
      }
    }

    await category.update({
      name: name || category.name,
      code: code || category.code,
      unit: unit || category.unit,
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
    const category = await ExpenseCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลประเภทค่าใช้จ่าย' });
    }

    await category.destroy();
    res.json({ message: 'ลบประเภทค่าใช้จ่ายเรียบร้อยแล้ว' });
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
