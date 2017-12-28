const express = require('express')
const router = express.Router()
// var moment = require('moment')
// const passport = require('passport');
const passport = require('../config/passportconfig')

const Restaurant = require('../models/restaurant')
const Tag = require('../models/tag');
const Review = require('../models/review')
const User = require('../models/user')

router.get('/', (req, res) => {
  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress
  var new_ip = req.connection.remoteAddress
  // console.log(moment().format('YYYY'));
  // console.log(ip);
  // console.log(new_ip);
  res.render("index")
})

router.get('/auth/login', (req, res) => {
  res.render("sign-login")
})
/* how it works */
router.get('/how-it-works', (req, res) => {
  res.render("how-it-works")
})

/* restaurants */
router.get('/restaurants', (req, res) =>{
        // get all the restaurants
      Restaurant.find({})
      .populate({ //deep population
          path: 'reviews',
          model: 'Review',
          populate: {
            path: 'user',
            model: 'User'
          }
        })
      .populate('tags')
      .exec(function(err, restaurants) {
        if (err) throw err;
        // res.send(restaurants)
        res.render('restaurant/index', { restaurants :restaurants})
      });

});

router.post('/restaurants', (req, res) =>{
        res.send('restaurant/index')
});

router.get('/restaurants/show/:id', (req, res) =>{

  Restaurant.findById(req.params.id)
  .populate('tags')
  .populate({ //deep population
      path: 'reviews',
      model: 'Review',
      populate: {
        path: 'user',
        model: 'User'
      }
    })
  .exec(function(err, restaurant) {
    if (err) throw err;
    console.log(req.params.id);
    // res.send(restaurant)
    res.render('restaurant/show', { restaurant :restaurant})
  });

})

router.get('/search/', (req, res) => {
    console.log(req.query.search)
  let data = req.query.search
    Restaurant.find({'name' : new RegExp(data, 'i')}).exec((err, restaurants)=>{
        if (err) throw err;

            res.render('restaurant/search',{restaurants : restaurants})
    })

})

router.get('/profile', isLoggedIn, function(req, res) {
      console.log(req.user)
       res.render('user/view', {
           user : req.user // get the user out of session and pass to template
       });
   });

   // =====================================
 // FACEBOOK ROUTES =====================
 // =====================================
 // route for facebook authentication and login
 router.get('/auth/facebook', passport.authenticate('facebook', {
   scope:['public_profile','email']
 }));

 // handle the callback after facebook has authenticated the user
 router.get('/auth/facebook/callback',
            passport.authenticate('facebook',
                    { successRedirect: '/restaurants',
                      failureRedirect: '/auth/login'
                    }));

 // route for logging out
 router.get('/auth/logout', function(req, res) {
     req.logout();
     res.redirect('/');
 });
// 500 error handler (middleware)
router.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('error');
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        return next();
      }
    // if they aren't redirect them to the home page
    res.redirect('/auth/login');
}


module.exports = router
