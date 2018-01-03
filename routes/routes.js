const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary')
// var moment = require('moment')
// const passport = require('passport');
const passport = require('../config/passportconfig')

const Restaurant = require('../models/restaurant')
const Tag = require('../models/tag');
const Review = require('../models/review')
const User = require('../models/user')

const RestaurantController = require('../controller/RestaurantController');

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
router.post('/restaurants/review', isLoggedIn, (req, res) =>{

  //get user reviews
  let user_review = req.body.review
  let which_restaurant = req.body.restaurant

  let user_food = parseInt(req.body.food)
  let user_service = parseInt(req.body.service)
  let user_recommend = parseInt(req.body.recommend)
  let user_clean = parseInt(req.body.clean)

  // console.log(which_restaurant);
  let mean = (user_food + user_service + user_recommend + user_clean)/ 4

  let review = new Review({
    description : user_review,
    user : req.user._id,
    rating:{
        food : user_food,
        service : user_service,
        recommend : user_recommend,
        clean : user_clean,
        total : mean
      }
  })

  console.log("review",review)

  let new_res = {
      $set:{final_rating : 2},
      $push:{reviews: review._id}
  }

  review.save((err)=>{
    if(err) console.log(err);

      Restaurant.findByIdAndUpdate(which_restaurant, new_res, function(error, result){
        if(error){
            console.log(err);
        }
        console.log(result)
        res.redirect('/restaurants/show/'+which_restaurant)
    });
  })

})

/* restaurants */
router.get('/restaurant/filter', (req, res) =>{
  // min=800&max=2000&ratingmin=2&ratingmax=4
  let min_amount = req.query.min
  let max_amount = req.query.max
  let rating_min = req.query.ratingmin
  let rating_max = req.query.ratingmax

  Restaurant.find({})
  // .where()
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
    Restaurant.count().exec((err, count)=>{
      if (err) throw err;

      res.json(restaurants)
      // res.render('restaurant/index', { restaurants :restaurants, current: page, pages: Math.ceil(count/perPage)})
    })

    //res.render('restaurant/index', { restaurants :restaurants})
  });


})

router.get('/restaurants', RestaurantController.index);

router.get("/restaurants/new", (req, res)=>{
  res.render('restaurant/new')
})
router.post('/restaurants/create', (req, res) =>{
    res.send('restaurant/index')
});

router.get('/restaurants/show/:id', RestaurantController.show)
router.get('/search/', RestaurantController.search)

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
