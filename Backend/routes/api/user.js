const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator')
require('dotenv').config()

// @route    POST api/users
// @desc     Register User
// @access   Public
router.post('/', async(req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
  }

  const {full_name, username, email, password } = req.body

  try {
    let user = await User.findOne({ email });

    if(user) {
      return res.status(400).json({ errors: [{msg: 'User already exists'}] })
    }
  } catch(error) {

  }
})