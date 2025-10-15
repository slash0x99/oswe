const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser')
const indexRouter = require('./routes/indexRoutes')
const blogRouter = require('./routes/blogRoutes')
const authRouter = require('./routes/authRoutes')
const dotenv = require('dotenv')
dotenv.config({path:'./configs/.env'})





//CONFIGS
app.use(bodyParser.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

app.use('/',indexRouter)
app.use('/',blogRouter)
app.use('/auth',authRouter)

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log('[+] Conected to MongoDB!')
})
.catch((err)=>{
    console.log(`ERR: ${err}`)
})


app.listen(3000,()=>{
    console.log(`
[!] App Started:
[=] http://localhost:3000/        
        `)
})