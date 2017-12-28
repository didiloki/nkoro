const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const exphbs = require('express-handlebars')
const path = require('path')
const express = require('express')
const passport = require('passport')
// const moment = require('moment')
const setup = require("./config/settings")

const app = express()
const PORT = process.env.PORT || 8000

const requestIp = require('request-ip');
app.use(requestIp.mw())

const routes = require('./routes/routes')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}
console.log(setup)
mongoose.Promise = global.Promise
mongoose.connect((setup.MONGODB_LIVE), { useMongoClient : true })
.then(()=>{ console.log("-- Mongoose ok ---")}, (err) =>{ console.log(err) } )

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json())// get information from html forms
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public'))) //Set static path to public
// MomentHandler.registerHelpers(exphbs) //handlebars date

app.engine('handlebars', exphbs({
  layoutsDir: "views/layouts",
  partialsDir: "views/partials",
  defaultLayout: 'main'}))
// app.set('views', (path.join(__dirname, 'views')))
app.set('view engine', 'handlebars')

// global.curYear = moment().format('YYYY')
app.set('trust proxy', 1)
app.use(session({ secret: 'iamproudtobeinWDI13', resave: false,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: 60000 } })); // session secret

//Passport ================
app.use(passport.initialize());
app.use(passport.session());

app.use(flash()); // use connect-flash for flash messages stored in session
app.use((req, res, next) => {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  res.locals.curIP = req.clientIp;

  next();
});

app.locals.copyright = "Copyrights Nkoro NG " + new Date().getFullYear() //get current year

// console.log(process.env)
console.log('The value of PORT is:', process.env.PORT);

// routes ===============================================================
app.use('/', routes)
app.get('*', (req, res)=>{
  res.render('error')
})
// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('error');
});

app.listen(PORT,()=>{
  console.log('--+ started +--');
})
