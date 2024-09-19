const express = require('express');
const { loginStaff, staffAuthentication, updateStaffPassword } = require('../Controller/Staff');
const staffRouter = express.Router();

staffRouter.post("/login" , loginStaff);
staffRouter.get('/check_auth' , staffAuthentication);
staffRouter.post("/update_password/:userId" , updateStaffPassword);

module.exports = staffRouter;