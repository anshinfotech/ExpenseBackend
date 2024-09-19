const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email : {
        type : String ,
        required : true,
    },
    password : {
        type : String ,
        required : true,
    },
    token : {
        type : String ,
        default : null,
    }
});

const adminModel = new mongoose.model("Admin" , adminSchema);

module.exports = adminModel;