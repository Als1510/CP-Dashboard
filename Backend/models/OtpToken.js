const mongoose = require('mongoose')

const OtpTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otpCode: {
    type: Number
  },
  expiresIn: {
    type: Number
  }
})

module.exports = otpToken = mongoose.model('otpToken', OtpTokenSchema)