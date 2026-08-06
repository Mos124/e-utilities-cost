const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', expenseController.getAll);
router.post('/', expenseController.create);
router.get('/:id', expenseController.getById);
router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

module.exports = router;
