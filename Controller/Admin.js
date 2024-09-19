const adminModel = require("../Modals/Admin");
const staffModel = require("../Modals/Staff");
const studentModel = require("../Modals/Students");
const incomeModel = require("../Modals/Income");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const admin_key = process.env.AIT_SECRET_KEY;
const COMPANY_MAIL = process.env.COMPANY_MAIL;
const COMPANY_MAIL_PASS = process.env.COMPANY_MAIL_PASS;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

const isCorrectEmail = (email) => {
  const regrex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/;
  return regrex.test(email);
};

const generatePassword = () => {
  let pass = "";
  const alphabets =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&*";

  for (let i = 1; i <= 8; i++) {
    let rand = Math.floor(Math.random() * alphabets.length);
    pass = pass + alphabets.charAt(rand);
  }

  return pass;
};

const transportor = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: COMPANY_MAIL,
    pass: COMPANY_MAIL_PASS,
  },
});

const registerAdmin = async (req, res) => {
  try {
    const { email, password, key } = req.body;

    if (!email || !password || !key) {
      return res.status(422).json({
        success: false,
        message: "Missing input fields",
      });
    }

    if (!isCorrectEmail(email)) {
      return res.status(422).json({
        success: false,
        message: "Incorrect email format!",
      });
    }

    if (key !== admin_key.toString()) {
      return res.status(422).json({
        success: false,
        message: "Invalid Key",
      });
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await adminModel.create({
      email,
      password: hashPassword,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      Data: newAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "Missing input fields",
      });
    }

    const isAdmin = await adminModel.findOne({ email });

    if (!isAdmin) {
      return res.status(400).json({
        success: false,
        message: "No Admin Found , incorrect email",
      });
    }

    const isMatched = await bcrypt.compare(password, isAdmin.password);

    if (!isMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = await jwt.sign({ adminId: isAdmin._id }, SECRET_TOKEN);

    isAdmin.token = token;

    await isAdmin.save();

    res.cookie("adminToken", token, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      Data: isAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const adminAuthentication = async (req, res) => {
  try {
    const adminToken = req.cookies.adminToken;

    if (!adminToken) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access. Please Login first",
      });
    }

    jwt.verify(adminToken, SECRET_TOKEN, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Unauthorized access.",
        });
      } else {
        const savedAdmin = await adminModel.findById(decoded.adminId);
        res.status(200).json({
          success: true,
          Data: savedAdmin,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const adminToken = req.cookies.adminToken;

    if (!adminToken) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access. Please Login first",
      });
    }

    jwt.verify(adminToken, SECRET_TOKEN, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Unauthorized access.",
        });
      } else {
        const savedAdmin = await adminModel.findById(decoded.adminId);
        savedAdmin.token = null;
        await savedAdmin.save();
        res.clearCookie("adminToken");

        res.status(200).json({
          success: true,
          message: "Logout Successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const addStaffMembers = async (req, res) => {
  try {
    const { name, empId, email, department } = req.body;

    if (!name || !empId || !email || !department) {
      return res.status(422).json({
        success: false,
        message: "Missing input fields",
      });
    }

    const isExisted = await staffModel.findOne({ empId });

    if (isExisted) {
      return res.status(400).json({
        success: false,
        message: "Employee already added",
      });
    }

    const password = generatePassword();
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newEntry = await staffModel.create({
      name,
      email,
      password: hashPassword,
      empId,
      department,
    });

    const notification = {
      from: COMPANY_MAIL,
      to: email,
      subject: "Password Credentials from Ansh Infotech",
      text: `Your account has been successfully created for employee ID : ${empId}. This is your password {Password : ${password}} , please don't share it with others`,
    };

    await transportor.sendMail(notification);

    res.status(201).json({
      success: true,
      message: "Entry Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const getAllStaffMembers = async (req, res) => {
  try {
    const data = await staffModel.find();

    if (!data || data.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "No data to fetch",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      Data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const deleteStaffMember = async (req, res) => {
  try {
    const { epId } = req.params;

    const deletedUser = await staffModel.findByIdAndDelete(epId);

    if (!deletedUser) {
      return res.status(400).json({
        success: false,
        message: "Failed to deleted User",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const registerNewStudent = async (req, res) => {
  try {
    const {
      name,
      fatherName,
      motherName,
      college,
      mobile,
      email,
      course,
      duration,
      batch,
      totalFees,
      payment,
      paymentMethod,
    } = req.body;

    if (
      !name ||
      !fatherName ||
      !motherName ||
      !college ||
      !email ||
      !mobile ||
      !course ||
      !duration ||
      !batch ||
      !totalFees ||
      !payment ||
      !paymentMethod
    ) {
      return res.status(422).json({
        success: false,
        message: "Missing Input Fields",
      });
    }

    if (!isCorrectEmail(email)) {
      return res.status(422).json({
        success: false,
        message: "Invalid Email!, Enter correct email",
      });
    }

    const isUser = await studentModel.findOne({ email });

    if (isUser) {
      return res.status(422).json({
        success: false,
        message: "User already existed with this email",
      });
    }

    const genpass = generatePassword();
    const password = await bcrypt.hash(genpass, saltRounds);

    const userInstance = await studentModel.create({
      name,
      password,
      fatherName,
      motherName,
      college,
      mobile,
      email,
      course,
      batch,
      duration,
      totalFees,
      createdDate: Date.now(),
    });

    if (!userInstance) {
      return res.status(400).json({
        success: false,
        message: "Failed to register student",
      });
    }

    const studentNotification = {
      from: process.env.COMPANY_MAIL,
      to: email,
      subject: "Registration with Ansh Infotech",
      html: `
        <h3>Hello, greetings from Ansh Infotech,</h3>
        <p>Your registration process with Ansh Infotech has been completed successfully, and we warmly welcome you to our well-reputed institute. ${name}, our best wishes are always with you. Below are your account credentials. Please do not share your password with anyone.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${genpass}</p>
        <br/>
        <h4>Course Details</h4>
        <p><b>Course :</b> ${course}</p>
        <p><b>Duration :</b> ${duration}</p>
        <p><b>Course Fees :</b> Rs.${totalFees}/-</p>
        <p><b>Advance payment :</b> Rs.${payment}/-</p>
        <br/>
        <p>If you have any inquiries, you can connect with us via email at: anshinfotech1@gmail.com</p>
        <br/>
        <p>Follow us on Instagram:</p>
        <a href="https://www.instagram.com/anshinfotech/">Click Here</a>
        <p>Follow us on LinkedIn:</p>
        <a href="https://www.linkedin.com/company/ansh-infotech1/">Click Here</a>
        <br/>
        <p>Best regards,</p>
        <p>Ansh Infotech</p>
        <p>@noreplyonthismail</p>
      `,
    };

    await transportor.sendMail(studentNotification);

    const incomeInstance = await incomeModel.create({
      studentId: userInstance._id.toString(),
      course,
      duration,
      totalFees,
      paymentMethod,
        Data: userInstance,
      EMIs: new Array({ installment: payment, installmentDate: Date.now() }),
      paymentDate: Date.now(),
    });

    if (incomeInstance) {
      res.status(201).json({
        success: true,
        message: "Registration completed successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Registration failed, something went wrong",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  adminAuthentication,
  logoutAdmin,
  addStaffMembers,
  getAllStaffMembers,
  deleteStaffMember,
  registerNewStudent,
};
