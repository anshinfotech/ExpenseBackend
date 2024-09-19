const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    paymentMethod : {type : String , required : true},
    paymentType : {type : String , required : true},
    expense : {type : Number , required : true},
    description : {type : String , required : true},
    paymentDate : {type : Date , default : Date.now()},
});

const expenseModel = new mongoose.model("expenses" , expenseSchema);

module.exports = expenseModel;