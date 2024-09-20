const staffModel = require("../Modals/Staff");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
// const SECRET_TOKEN = process.env.SECRET_TOKEN;
const SECRET_TOKEN = "458fjfifm@#$85$%HJLJUDJI789654#$%%^%^&"

const loginStaff = async (req, res) => {
  try {
    const { empId, password } = req.body;

    if (!empId || !password) {
      return res.status(422).json({
        success: false,
        message: "Missing Input Fields",
      });
    }

    const isUser = await staffModel.findOne({ empId });

    if (!isUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials, no user found!",
      });
    }

    const isCorrectPass = await bcrypt.compare(password, isUser.password);

    if (!isCorrectPass) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = await jwt.sign({ userId: isUser._id }, SECRET_TOKEN);

    isUser.token = token;

    await isUser.save();

    res.cookie("empToken", token, {
      maxAge: 1000 * 60 * 5,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Account Login Successfully",
      Data: isUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const staffAuthentication = async (req, res) => {
  try {
    const empToken = req.cookies.empToken;

    if (!empToken) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access. Please Login first",
      });
    }

    jwt.verify(empToken, SECRET_TOKEN, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Unauthorized access.",
        });
      } else {
        const savedUser = await staffModel.findById(decoded.userId);
        res.status(200).json({
          success: true,
          Data: savedUser,
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

const updateStaffPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { updatePassword } = req.body;

    if (!updatePassword) {
      return res.status(422).json({
        success: false,
        message: "Missing Input Fields",
      });
    }
    const saltRounds = 10;
    const hashUpdatedPass = await bcrypt.hash(updatePassword , saltRounds);

    const updatedUser = await staffModel.findByIdAndUpdate(
      userId,
      { password: hashUpdatedPass },
      { $set: true }
    );

    if (!updatedUser) {
      return res.status(422).json({
        success: false,
        message: "Failed to update details",
      });
    }

    res.status(200).json({
        success : true,
        message : "Password updated successfully",
        Data : updatedUser,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

module.exports = {
  staffAuthentication,
  loginStaff,
  updateStaffPassword,
};
