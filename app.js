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
const MongoStore = require('connect-mongo')(session)
const setup = require("./config/settings")
const cloudinary = require('cloudinary')

cloudinary.config({
  cloud_name: 'sample',
  api_key: '874837483274837',
  api_secret: 'a676b67565c6767a6767d6767f676fe1'
})

const app = express()
const PORT = process.env.PORT || 8000

const routes = require('./routes/routes')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

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
  defaultLayout: 'main',
  helpers: {
      foo: function () { return 'FOO!'; },
      iff: function(a, operator, b, opts) {
          var bool = false;
          switch(operator) {
             case '==':
                 bool = a == b;
                 break;
             case '>':
                 bool = a > b;
                 break;
             case '<':
                 bool = a < b;
                 break;
             case '!==':
                 bool = a !== b;
                 break;
             default:
                 throw "Unknown operator " + operator;
          }

          if (bool) {
              return opts.fn(this);
          } else {
              return opts.inverse(this);
          }
      }
  }
}))

// app.set('views', (path.join(__dirname, 'views')))
app.set('view engine', 'handlebars')

// global.curYear = moment().format('YYYY')
// app.set('trust proxy', 1)
app.use(session({
  secret: 'iamproudtobeinWDI13',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ url: setup.MONGODB_LIVE }),
})); // session secret

//Handlebars registerHelpers
// exphbs.registerHelper('iff', function(a, operator, b, opts) {
//     var bool = false;
//     switch(operator) {
//        case '==':
//            bool = a == b;
//            break;
//        case '>':
//            bool = a > b;
//            break;
//        case '<':
//            bool = a < b;
//            break;
//        default:
//            throw "Unknown operator " + operator;
//     }
//
//     if (bool) {
//         return opts.fn(this);
//     } else {
//         return opts.inverse(this);
//     }
// })
//Passport ================
app.use(passport.initialize());
app.use(passport.session());

app.use(flash()); // use connect-flash for flash messages stored in session
app.use((req, res, next) => {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;

  next();
});

app.locals.copyright = "Copyrights Nkoro NG " + new Date().getFullYear() //get current year

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
