const express = require('express');
const { registerAdmin, loginAdmin, adminAuthentication, logoutAdmin, addStaffMembers, getAllStaffMembers, deleteStaffMember, registerNewStudent } = require('../Controller/Admin');
const adminRouter = express.Router();

adminRouter.post('/register_admin' , registerAdmin);
adminRouter.post('/login_admin' , loginAdmin);
adminRouter.get("/admin_auth" , adminAuthentication);
adminRouter.get("/admin_logout" , logoutAdmin);
adminRouter.post("/add_staff" , addStaffMembers);
adminRouter.get("/get_staff_members" , getAllStaffMembers);
adminRouter.get("/delete_member/:epId" , deleteStaffMember);
adminRouter.post('/new_registration' , registerNewStudent);

module.exports = adminRouter;