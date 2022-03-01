const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')
const app = express()
require('dotenv').config()

const corsOptions = {
  origin: ["http://localhost:8100", "https://cp-dashboard.netlify.app"]
}

app.use(cors(corsOptions))

connectDB()

app.use(express.json({extended: false}))

app.get('/', (req, res) => {
  res.send('API Running')
})

app.use('/api/user', require('./routes/api/user'))
app.use('/api/validation', require('./routes/api/validation'))
app.use('/api/auth', require('./routes/api/auth'))

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))