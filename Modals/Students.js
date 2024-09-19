const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password : { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  college: { type: String, required: true },
  mobile: { type: Number, required: true },
  email: { type: String, required: true },
  course: { type: String, required: true },
  batch : {type : String , required : true},
  duration: { type: String, required: true },
  totalFees: { type: Number, required: true },
  createdDate : {type : Date , default : Date.now()},
});

const studentModel = new mongoose.model("students" , studentSchema);

module.exports = studentModel;
