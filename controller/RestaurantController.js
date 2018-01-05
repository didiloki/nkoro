const upload = require('../helpers/imageupload')
//----models---//
const Restaurant = require('../models/restaurant')
const Tag = require('../models/tag');
const Review = require('../models/review')
const User = require('../models/user')

  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }



//index controller
exports.index = (req, res) =>{

  let perPage = 10
  let page = req.query.page || 1

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
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, restaurants) {
        Restaurant.count().exec((err, count)=>{
          if (err) throw err;
          res.render('restaurant/index', { restaurants :restaurants, current: page, pages: Math.ceil(count/perPage)})
        })

        //res.render('restaurant/index', { restaurants :restaurants})
      });
}

//Show controller
exports.show = (req, res) =>{

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

    let sum = 0 //sum of all total review
    let average = 0 //average

    for(var o = 0; o < restaurant.reviews.length; o++){
      sum += parseInt(restaurant.reviews[o].rating.total)
    }

    average = sum / restaurant.reviews.length

    // res.send(restaurant)
    res.render('restaurant/show', { restaurant :restaurant, average : average })
  });

}

//Search controller
exports.search = (req, res) => {

    let data = req.query.search
    Restaurant.find({'name' : new RegExp(data, 'i')}).exec((err, restaurants)=>{
        if (err) throw err

        res.render('restaurant/search',{restaurants : restaurants})
    })

}

//Create Restaurant
exports.createRestaurant = (req, res) =>{

  upload(req, res, (err) =>{
    if(err){
      console.log(err);
      req.flash('error', 'File is too Large')
      res.render('restaurant/new')
    }else{
      if(req.file == undefined){
        req.flash('error', 'File is too Large')
        res.render('restaurant/new', {
          error: 'Error: No File Selected!'
        })
      } else {
        let entry = new Restaurant({
            location : {
              longitude : req.body.lng,
              latitude : req.body.lat,
              address: req.body.address,
              city : req.body.city,
              country : "Nigeria"
            },
            name : req.body.name,
            description: req.body.desc,
            phone : req.body.phone,
            email : req.body.email,
            cuisine : req.body.cuisine,
            image : req.file.filename,
            final_rating : 0
          })

        entry.save((error) =>{
          if(error) throw error

          req.flash('success', 'Restaurant added and pending verification!')
          res.redirect('/restaurants')

        })


      }
    }
  })

//AIzaSyAGNfQNKn-rt2wR9z7szBibbcyayU2TtH0
}

//Post new Restaurant review
exports.postReview = (req, res) =>{

  //get user reviews
  let user_review = req.body.review
  let which_restaurant = req.body.restaurant

  let user_food = parseInt(req.body.food)
  let user_service = parseInt(req.body.service)
  let user_recommend = parseInt(req.body.recommend)
  let user_clean = parseInt(req.body.clean)

  let final_rating = 0
  let sum = 0 // sum of all total reviews

  // console.log(which_restaurant);
  let temp = (user_food + user_service + user_recommend + user_clean)/ 4
  let mean = temp.toFixed(2)

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

  //get all total in Reviews
  Review.find({}).select('rating').exec((err, r)=>{

      r.forEach((x)=>{
        //get the sum of all totals
        sum += x.rating.total
      })
      // get average total
      let tmp = sum/r.length
      final_rating = tmp.toFixed(2)
  })

  let new_res = {
      $set:{final_rating : final_rating},
      $push:{reviews: review._id}
  }

  review.save((err)=>{
    if(err) console.log(err);

      Restaurant.findByIdAndUpdate(which_restaurant, new_res, function(error, result){
        if(error){
            console.log(err);
        }
        console.log(result)
        req.flash('success', 'Review Added!')
        res.redirect('/restaurants/show/'+which_restaurant)
    });
  })

}


exports.filter =(req, res) =>{
  // min=800&max=2000&ratingmin=2&ratingmax=4
  let min_amount = req.query.min
  let max_amount = req.query.max
  let rating_min = req.query.ratingmin
  let rating_max = req.query.ratingmax

  Restaurant.find({})
  .where('final_rating').gt(rating_min).lt(rating_max)
  .where()
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

      // res.json(restaurants)
      res.render('restaurant/index', { restaurants :restaurants})
    })

    //res.render('restaurant/index', { restaurants :restaurants})
  });


}
