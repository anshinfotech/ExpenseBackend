const studentModel = require("../Modals/Students");
const incomeModel = require("../Modals/Income");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const nodemailer = require("nodemailer");

const transporter = new nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COMPANY_MAIL,
    pass: process.env.COMPANY_MAIL_PASS,
  },
});

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



module.exports = {
};
