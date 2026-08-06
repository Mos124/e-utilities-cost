const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategory.controller');
const budgetCategoryController = require('../controllers/budgetCategory.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Expense Categories
router.get('/expense-categories', verifyToken, expenseCategoryController.getAll);
router.post('/expense-categories', verifyToken, requireAdmin, expenseCategoryController.create);
router.put('/expense-categories/:id', verifyToken, requireAdmin, expenseCategoryController.update);
router.delete('/expense-categories/:id', verifyToken, requireAdmin, expenseCategoryController.remove);

// Budget Categories
router.get('/budget-categories', verifyToken, budgetCategoryController.getAll);
router.post('/budget-categories', verifyToken, requireAdmin, budgetCategoryController.create);
router.put('/budget-categories/:id', verifyToken, requireAdmin, budgetCategoryController.update);
router.delete('/budget-categories/:id', verifyToken, requireAdmin, budgetCategoryController.remove);

module.exports = router;
