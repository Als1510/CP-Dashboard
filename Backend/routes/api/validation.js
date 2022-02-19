const express = require('express')
const router = express.Router()
const path = require('path')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')
const OtpToken = require('../../models/OtpToken')

// @route   GET api/validation/varify/:uniqueString
// @desc    Verify User
// @access  Public
router.get('/verify/:uniqueString', async (req, res) => {
  const uniqueString = req.params.uniqueString
  const user = await User.findOne({ uniqueString: uniqueString })

  if(user) {
    await User.updateOne({_id: user._id}, {$set: {active: true}})
    res.sendFile(path.join(__dirname + '../../../config/activationResponseSuccess.html'))
  } else {
    res.sendFile(path.join(__dirname + '../../../config/activationResponseFailure.html'))
  }
})

// @route   POST api/validation
// @desc    Verify User
// @access  Public
router.post('/', [
  check('email', 'Please enter a valid email').isEmail()
], async(req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email } = req.body

  try{
    let user = await User.findOne({ email })

    if(!user) {
      return res.status(400).json({ errors: [{ msg: 'Email does not exists. Please create a new account' }] })
    }

    let previousRecord = await OtpToken.findOne({ email })

    if(previousRecord) {
      let currTime = new Date().getTime()
      let diff = previousRecord.expiresIn - currTime
      if(diff > 0) {
        return res.json({ msg: 'Otp has been sent to your registered email', name: user.name })
      } else {
        await OtpToken.deleteOne({ email })
      }
    }

    let otpCode = Math.floor((Math.random() * 1000000) + 1)

    let otpData = new OtpToken({
      email,
      otpCode,
      expiresIn: new Date().getTime() + 300*1000
    })

    await otpData.save()
    
    res.json({ msg: "Otp has been sent to your registered email", name: user.name});

  } catch(error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})


// @route   POST api/validation/resetpassword
// @desc    Change password
// @access  Public
router.post('/resetpassword', [
  check('otpCode', 'Please enter otp').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otpCode, password } = req.body

  try{
    let otpData = await OtpToken.findOne({ email, otpCode })
    
    if(!otpData) {
      return res.status(400).json({ errors: [{ msg: 'Otp is invalid' }] })
    }

    let currTime = new Date().getTime()
    let diff = otpData.expiresIn - currTime
    if(diff < 0) {
      return res.status(400).json({ errors: [{ msg : 'Otp is invalid' }] })
    }

    let user = await User.findOne({ email })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()
    await OtpToken.deleteOne({ email })

    res.json({ msg: 'Password changed successfully' })
  } catch(error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router