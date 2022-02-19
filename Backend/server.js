const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')
const app = express()
require('dotenv').config()

const corsOptions = {
  origin: "http://localhost:8100"
}

app.use(cors(corsOptions))

connectDB()

app.use(express.json({extended: false}))

app.get('/', (req, res) => {
  res.send('API Running')
})

app.use('/api/user', require('./routes/api/user'))

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))