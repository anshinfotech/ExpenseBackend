const express = require('express');
const { addIncome, getAllIncomes, deleteIncome, deleteAllIncomes, updateInstallement } = require('../Controller/Income');
const incomeRouter = express.Router();

incomeRouter.post('/add_income' , addIncome);
incomeRouter.get('/get_all_income' , getAllIncomes);
incomeRouter.get('/delete_income/:id' , deleteIncome);
incomeRouter.get('/delete_all_incomes' , deleteAllIncomes);
incomeRouter.post('/update_installment' , updateInstallement);

module.exports = incomeRouter;