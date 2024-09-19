const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name : {type : String , required : true},
    empId : {type : String , required : true},
    email : {type : String , required : true},
    password : {type : String , required : true},
    department : {type : String , required : true},
    token : {type : String , default : null},
});

const staffModel = new mongoose.model('staff' , staffSchema);

module.exports = staffModel;