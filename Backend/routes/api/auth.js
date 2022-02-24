const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
require('dotenv').config()

const User = require('../../models/User')

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Please register your account' }] })
    }

    if (user.active === 'false') {
      let registeredTime = user.date.getTime() + 60 * 60 * 24 * 1000
      let currTime = new Date().getTime()
      if (registeredTime - currTime < 0) {
        await user.remove();
        return res.status(400).json({ errors: [{ msg: 'Please register your account' }] })
      } else {
        return res.status(400).json({ errors: [{ msg: 'Please activate your account by clicking activate link on your registered e-mail.' }] });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
    }

    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: 360000 },
      (error, token) => {
        if(error) throw error
        res.json({ token, name: user.name, id: user.id, username: user.username })
      }
    )

  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error!')
  }

})

module.exports = router;