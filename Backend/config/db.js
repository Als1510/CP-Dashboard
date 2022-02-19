const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
  try{
    await mongoose.connect(process.env.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB Conencted....')
  } catch(error) {
    console.error(error.message)
    process.exit()
  }
}

module.exports = connectDB