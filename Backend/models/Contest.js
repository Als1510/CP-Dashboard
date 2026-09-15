const mongoose = require('mongoose');
const ContestSchema = new mongoose.Schema({
  name: String,
  startTime: String,
  startsOn: String,
  duration: String,
  url: String,
  platform: String,
  createdAt: { type: Date },
  storedDateTime: { type: Date, default: Date.now }
})

module.exports = Contest = mongoose.model('contest', ContestSchema)