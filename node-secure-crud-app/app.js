const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser')
const Sequeilize = require('sequelize')
const User = require('./models/userModels')
const indexRouter = require('./routes/indexRoutes')
const blogRouter = require('./routes/blogRoutes')
const authRouter = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const authMiddleware = require('./middleware/authMiddleware')

dotenv.config({path:'./configs/.env'})





//CONFIGS
app.use(bodyParser.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname,'public')))
app.use(authMiddleware.userControlMiddleware);
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//VIEW ENGINE   
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
// app.use(express.static(path.join(__dirname, 'public')));
//ROUTES
app.use('/',indexRouter)
app.use('/',blogRouter)
app.use('/auth',authRouter)


app.use((req, res, next) => {
  res.status(404).redirect('/404');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Rate limit error-u yoxlayın
  if (err.status === 429) {
    return res.status(429).redirect('/429');
  }
  
  // Digər bütün errorlar
  res.status(err.status || 500).redirect('/500'); 
});


//SQL CONNECTIONS

//NOSQL
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