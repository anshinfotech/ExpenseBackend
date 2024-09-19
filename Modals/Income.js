const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  mobile: { type: Number, required: true },
  email: { type: String, required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  batch : {type : String , required : true},
  duration: { type: String, required: true },
  totalFees: { type: Number, required: true },
  EMIs: [
    {
      installmentMethod : {type : String , required : true},
      installment: { type: Number , required : true},
      transactionId : {type : String , default : null},
      installmentDate : {type : Date , default : Date.now()},
    },
  ],
  paymentMethod: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now() },
  isFeesCompleted : {type : Boolean , default : false},
});

const incomeModel = new mongoose.model("incomes", incomeSchema);

module.exports = incomeModel;
