const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
require('./config/db')

const corsOptions = {
  origin: "http://localhost:8100"
}

app.use(cors(corsOptions))

app.use(express.json({extended: false}))

app.get('/', (req, res) => {
  res.send('API Running')
})

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))