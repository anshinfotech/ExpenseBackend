const express = require("express");
const app = express();
const connectDatabase = require("./database");
const adminRouter = require("./Routes/Admin");
const staffRouter = require("./Routes/Staff");
const expenseRouter = require("./Routes/Expense");
const incomeRouter = require("./Routes/Income");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const studentRouter = require("./Routes/Student");
require("dotenv").config();
const PORT = process.env.PORT;

connectDatabase();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://expensefrontend-xq1k.onrender.com",
    credentials: true,
    methods: ["POST", "GET", "DELETE"],
  })
);

app.use("/admin", adminRouter);
app.use("/expenses", expenseRouter);
app.use("/staff", staffRouter);
app.use("/incomes", incomeRouter);
app.use('/student',studentRouter);

app.listen(PORT, () => {
  console.log(`AIT Expense Tracker is running at http://localhost:${PORT}`);
});
