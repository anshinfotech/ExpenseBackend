const mongoose = require('mongoose');
require('dotenv').config();
const URI = process.env.DATABASE;

const connectDatabase = async() => {
    try {
        await mongoose.connect(URI);
        console.log(`AIT Expense Tracker Database is connected`);
    } catch (error) {
        console.log(`Error occured in connecting to database ${error.message}`);
    }
}

module.exports = connectDatabase;