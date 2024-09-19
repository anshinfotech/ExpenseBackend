const express = require('express');
const {addExpense, getAllExpenses, deleteExpense, deleteAllExpenses} = require("../Controller/Expense");
const expenseRouter = express.Router();

expenseRouter.post("/add_expense" , addExpense);
expenseRouter.get("/all_expenses" , getAllExpenses);
expenseRouter.get('/delete_expense/:id' , deleteExpense);
expenseRouter.get("/delete_all_expenses" , deleteAllExpenses);

module.exports = expenseRouter;