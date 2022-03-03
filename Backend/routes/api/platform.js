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
    let platform = await Platform.findOne({ user: req.user.id })

    if(platform) {
      return res.json({platform})
    }

    platform = new Platform({
      user: req.user.id,
      codechef: null,
      codeforces: null,
      spoj: null,
      leetcode: null,
      atcoder: null
    })

    await platform.save()

    res.json({platform})
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
    const platform = await Platform.findOneAndUpdate(
      { user: req.user.id},
      { $set: {[platformName] : username}},
      { new: true }
    )

    return res.json({platform, msg:"Data updated successfully"})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
}) 

module.exports = router;