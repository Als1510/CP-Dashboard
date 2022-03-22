const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')

const User = require('../../models/User')
const Platform = require('../../models/Platform')

// @route   GET api/platform/details
// @desc    Get current platform data
// @access  Private
router.get('/details', auth, async (req, res) => {
  try {
    let platformData = await Platform.findOne({ user: req.user.id })

    if(platformData) {
      return res.json({platformData})
    }

    platformData = new Platform({
      user: req.user.id,
      platform: {
        codeforces: null,
        spoj: null,
        leetcode: null,
        atcoder: null
      }
    })

    await platformData.save()

    res.json({platformData})
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error')
  }
})

router.put('/updateplatform', [auth, [
  check('platformName', 'Select a platform').not().isEmpty(),
  check('username', 'Please enter a valid username').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { platformName , username } = req.body;

  try {
    let platformData = await Platform.findOne({ user: req.user.id})
    if(platformName === "codeforces") platformData.platform.codeforces = username
    if(platformName === "spoj") platformData.platform.spoj = username
    if(platformName === "leetcode") platformData.platform.leetcode = username
    if(platformName === "atcoder") platformData.platform.atcoder = username

    await Platform.findOneAndUpdate(
      { user: req.user.id },
      { $set: platformData }, 
      { new: true }
    );

    return res.json({platformData, msg:"Data updated successfully"})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
}) 

module.exports = router;