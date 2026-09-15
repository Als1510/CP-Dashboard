const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  payload_json: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  last_fetched: {
    type: Date,
    required: true,
    default: Date.now
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  collection: 'profiles'
})

ProfileSchema.index({ platform: 1, username: 1 }, { unique: true })

module.exports = mongoose.model('Profile', ProfileSchema)
