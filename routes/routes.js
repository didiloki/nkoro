const express = require('express')
const router = express.Router()
// var moment = require('moment')
// const passport = require('passport');
const passport = require('../config/passportconfig')
const upload = require('../helpers/imageupload')
const Restaurant = require('../models/restaurant')
const Tag = require('../models/tag');
const Review = require('../models/review')
const User = require('../models/user')

const RestaurantController = require('../controller/RestaurantController')


router.get('/', (req, res) => {
  // var ip = req.header('x-forwarded-for') || req.connection.remoteAddress
  // var new_ip = req.connection.remoteAddress
  // // console.log(moment().format('YYYY'));
  // // console.log(ip);
  // // console.log(new_ip);
  res.render("index")
})

router.get('/auth/login', (req, res) => {
  res.render("sign-login")
})
/* how it works */
router.get('/how-it-works', (req, res) => {
  res.render("how-it-works")
})
/*Reviews*/
router.post('/restaurants/review', isLoggedIn, RestaurantController.postReview)

/* restaurants */
router.get('/restaurants', RestaurantController.index)
router.get('/restaurants/finder', RestaurantController.finder)
router.get('/restaurant/filter', RestaurantController.filter)
router.get("/restaurants/new", isLoggedIn, RestaurantController.new)
router.post('/restaurants/new', isLoggedIn, RestaurantController.createRestaurant);

router.get('/restaurants/show/:id', RestaurantController.show)
router.get('/search/', RestaurantController.search)
router.get('/profile', isLoggedIn, function(req, res) {
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
                      failureRedirect: '/auth/login',
                      successFlash: 'Thank you for Registering!',
                      failureRedirect : 'Error: Please Try Again'
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
