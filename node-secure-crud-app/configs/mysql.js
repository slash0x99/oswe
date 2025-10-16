const Sequeilize = require('sequelize')
const dotenv = require('dotenv')
dotenv.config({path:'./.env'})

export const sequelize = new Sequeilize(
    process.env.DB_NAME,
    process.env.USER,
    process.env.DB_PASS,  

)