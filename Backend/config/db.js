const Sequelize = require('sequelize');
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DATABASE_NAME, 
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: "mysql"
  }
);

sequelize.authenticate().then( () => {
  console.log('Connection has been established')
})
.catch( error => {
  console.log('Unable to connect', error)
})

module.exports = sequelize