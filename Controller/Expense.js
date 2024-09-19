const expenseModel = require("../Modals/Expenses");

const addExpense = async (req, res) => {
  try {
    const { expense, description, paymentType , paymentMethod } = req.body;

    if (!expense || !description || !paymentType || !paymentMethod) {
      return res.status(422).json({
        success: false,
        message: "Missing Input Fields",
      });
    }

    await expenseModel.create({
      expense,
      description,
      paymentType,
      paymentMethod,
      paymentDate: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong , try to contact with ANSH Infotech.",
      error: error.message,
    });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const allData = await expenseModel.find();

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

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: true,
        message: "No expense ID found",
      });
    }

    await expenseModel.findByIdAndDelete(id);

    const allData = await expenseModel.find();

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

const deleteAllExpenses = async (req, res) => {
  try {

    await expenseModel.deleteMany({});

    res.status(200).json({
      success : true,
      message : "Data deleted successfully"
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
  addExpense,
  getAllExpenses,
  deleteExpense,
  deleteAllExpenses,
};
