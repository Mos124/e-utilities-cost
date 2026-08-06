const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyToken, requireStaffOrAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', expenseController.getAll);
router.get('/:id', expenseController.getById);

router.post('/', requireStaffOrAdmin, expenseController.create);
router.put('/:id', requireStaffOrAdmin, expenseController.update);
router.delete('/:id', requireStaffOrAdmin, expenseController.remove);

module.exports = router;
