const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')
dotenv.config({ path: './configs/.env' })

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
)

;(async () => {
    try {
        await sequelize.authenticate()
        console.log('[+] Connected to MySQL!')

        await sequelize.sync({ alter: true })
        console.log('[+] Tables synced successfully!')
    } catch (err) {
        console.log(`ERR: ${err}`)
    }
})()

module.exports = { sequelize }
