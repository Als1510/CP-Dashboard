const mongoose = require('mongoose')

const PlatformSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  platform: {
    codechef:{
      type: String,
    },
    codeforces: {
      type: String,
    },
    leetcode: {
      type: String,
    },
    atcoder: {
      type: String,
    }
  }
})

module.exports = Platform = mongoose.model('platform', PlatformSchema)