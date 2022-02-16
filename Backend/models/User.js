const Sequelize = require("sequelize")
const sequelize = require("../config/db")
const User = sequelize.define("user", 
  {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullname: {
      type: Sequelize.STRING,
      allowNull: false,      
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    email:{
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    timestamps: false,
    freezeTableName: true
  }
)

module.exports = User;