const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator')
require('dotenv').config()

