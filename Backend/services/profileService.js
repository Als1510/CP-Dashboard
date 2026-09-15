const Profile = require('../models/Profile')

async function getProfile(platform, username) {
  const normalized = (username || '').trim().toLowerCase()
  if (!normalized) return null
  return Profile.findOne({ platform: platform, username: normalized })
}

async function saveProfile(platform, username, payload) {
  const normalized = (username || '').trim().toLowerCase()
  if (!normalized || !platform) throw new Error('platform and username required')

  const existing = await Profile.findOne({ platform: platform, username: normalized })
  if (existing) {
    existing.payload_json = payload
    existing.last_fetched = new Date()
    return existing.save()
  }

  const profile = new Profile({
    platform: platform,
    username: normalized,
    payload_json: payload,
    last_fetched: new Date(),
    created_at: new Date()
  })
  return profile.save()
}

module.exports = {
  getProfile,
  saveProfile
}
