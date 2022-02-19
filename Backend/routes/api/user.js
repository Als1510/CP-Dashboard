const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
require('dotenv').config()

const User = require('../../models/User')

const randString = () => {
  const len = 8
  let randStr = ''
  for(let i = 0; i < len; i++) {
    const ch = Math.floor((Math.random() * 10) + 1)
    randStr += ch
  }
  return randStr
}

// @route    POST api/users
// @desc     Register User
// @access   Public
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ], async (req, res) => {
  
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, password } = req.body;

    const uniqueString = randString()
    const active = false

    try {
      let user = await User.findOne({ email });

      if(user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists '}] })
      }

      let existedusername = await User.findOne({ username })
      
      if(existedusername) {
        return res.status(400).json({ errors: [{ msg: 'Username is already taken'}] })
      }

      user = new User({
        name,
        username,
        email,
        password,
        uniqueString,
        active
      })

      const salt = await bcrypt.genSalt(10)

      user.password = await bcrypt.hash(password, salt)

      await user.save()

      res.json({msg: "Verification link has been sent to your email account. Please activate your account", name})

    } catch(error) {
      console.error(error.message)
      res.status(500).send('Server Error!')
    }
})

module.exports = router