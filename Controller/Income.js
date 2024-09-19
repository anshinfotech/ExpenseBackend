const incomeModel = require("../Modals/Income");
const nodemailer = require("nodemailer");
const moment = require('moment');
require('dotenv').config();

const transporter = new nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COMPANY_MAIL,
    pass: process.env.COMPANY_MAIL_PASS,
  },
});

const addIncome = async (req, res) => {
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
      transactionId,
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

    const isUser = await incomeModel.findOne({ email });

    if (isUser) {
      return res.status(422).json({
        success: false,
        message: "User already existed with this email",
      });
    }

    await incomeModel.create({
      name,
      fatherName,
      motherName,
      college,
      mobile,
      email,
      course,
      batch,
      duration,
      totalFees,
      EMIs: new Array({ 
        installment: payment,
        installmentDate: Date.now() , 
        installmentMethod : paymentMethod,
        transactionId : (paymentMethod === "UPI(Bank)" || paymentMethod === "UPI(Personal)") ? transactionId : null ,
       }),
      paymentMethod,
      createdDate: Date.now(),
    });

    const studentNotification = {
      from: process.env.COMPANY_MAIL,
      to: email,
      subject: "Registration with Ansh Infotech",
      html: `
        <h3>Hello, greetings from Ansh Infotech,</h3>
        <p>Your registration process with Ansh Infotech has been completed successfully, and we warmly welcome you to our well-reputed institute. ${name}, our best wishes are always with you.</p>
        <br/>
        <h4>Student Details</h4>
        <p><b>Student Name :</b> ${name}</p>
        <p><b>Father's Name :</b> ${fatherName}</p>
        <p><b>Mother's Name :</b> ${motherName}</p>
        <p><b>Mobile :</b> ${mobile}</p>
        <p><b>College :</b> ${college}</p>
        <br/>
        <h4>Course Details</h4>
        <p><b>Course :</b> ${course}</p>
        <p><b>Duration :</b> ${duration}</p>
        <p><b>Course Fees :</b> Rs.${totalFees}/-</p>
        <p><b>Advance payment :</b> Rs.${payment}/-</p>
        <p><b>Balance pending :</b> Rs.${totalFees - payment}/-</p>
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

    await transporter.sendMail(studentNotification);

    res.status(201).json({
      success: true,
      message: "Payment added successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const getAllIncomes = async (req, res) => {
  try {
    const allData = await incomeModel.find();

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      Data: allData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: true,
        message: "No income ID found",
      });
    }

    await incomeModel.findByIdAndDelete(id);

    const allData = await incomeModel.find();

    res.status(200).json({
      success: true,
      message: `Item Deleted Successfully`,
      Data: allData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const deleteAllIncomes = async (req, res) => {
  try {
    await incomeModel.deleteMany({});

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

const updateInstallement = async (req, res) => {
  try {
    const { id, amount , installMethod , transactionId } = req.body;

    const isIncome = await incomeModel.findById(id);

    if (!isIncome) {
      return res.status(400).json({
        success: false,
        message: "Failed to update, no data found",
      });
    }

    const totalFees = isIncome.totalFees;
    const EMIs = isIncome.EMIs;
    const totalInstallments = EMIs.reduce((acc, index) => {
      return acc + index.installment;
    }, 0);

    if (totalFees < amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is larger than total fees",
      });
    }

    if (totalInstallments + amount > totalFees) {
      return res.status(400).json({
        success: false,
        message: `Total fees remaining is Rs.${
          totalFees - totalInstallments
        } and you paid Rs.${amount}`,
      });
    }

    isIncome.EMIs.push({ 
      installment: amount, 
      installmentDate: Date.now() , 
      installmentMethod : installMethod,
      transactionId : (installMethod === "UPI(Bank)" || installMethod === "UPI(Personal)") ? transactionId : null ,
    });
    await isIncome.save();

    if (isIncome.totalFees === totalInstallments + amount) {
      isIncome.isFeesCompleted = true;
      await isIncome.save();

      const studentNotification = {
        from: process.env.COMPANY_MAIL,
        to: isIncome.email,
        subject: "New Installment Received",
        html: `
          <h3>Hello, greetings from Ansh Infotech,</h3>
          <p>${isIncome.name} your balance fees has been received successfully by Ansh Infotech on ${moment(Date.now()).format('dddd , DD/MM/YYY')} at ${moment(Date.now()).format('hh:mm a')}.</p>
          <br/>
          <h4>Payment Details</h4>
          <p><b>Method of payment :</b> ${installMethod}</p>
          <p><b>Course Fees :</b> Rs.${isIncome.totalFees}/-</p>
          <p><b>Payment received :</b> Rs.${amount}/-</p>
          <p><b>Balance pending :</b> Rs.${totalFees - (totalInstallments + amount)}/-</p>
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

      await transporter.sendMail(studentNotification);

      res.status(200).json({
        success: true,
        message: "Total fees completed successfully",
        Data: isIncome,
      });
    } else {
      const studentNotification = {
        from: process.env.COMPANY_MAIL,
        to: isIncome.email,
        subject: "New Installment Received",
        html: `
          <h3>Hello, greetings from Ansh Infotech,</h3>
          <p>${isIncome.name} your balance fees has been received successfully by Ansh Infotech on ${moment(Date.now()).format('dddd , DD/MM/YYY')} at ${moment(Date.now()).format('hh:mm a')}.</p>
          <br/>
          <h4>Payment Details</h4>
          <p><b>Method of payment :</b> ${installMethod}</p>
          <p><b>Course Fees :</b> Rs.${isIncome.totalFees}/-</p>
          <p><b>Payment received :</b> Rs.${amount}/-</p>
          <p><b>Balance pending :</b> Rs.${totalFees - (totalInstallments + amount)}/-</p>
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

      await transporter.sendMail(studentNotification);

      res.status(200).json({
        success: true,
        message: "Balance updated successfully",
        Data: isIncome,
      });
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

module.exports = {
  addIncome,
  getAllIncomes,
  deleteIncome,
  deleteAllIncomes,
  updateInstallement,
};
