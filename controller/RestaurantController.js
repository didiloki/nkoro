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

    let sum_total = 0 //sum of all total review
    let average = 0 //average total
    let sum_total_food = 0
    let sum_total_service = 0
    let sum_total_recommend = 0
    let sum_total_clean = 0

    for(var o = 0; o < restaurant.reviews.length; o++){
      sum_total += parseInt(restaurant.reviews[o].rating.total)
      sum_total_food += parseInt(restaurant.reviews[o].rating.food)
      sum_total_service += parseInt(restaurant.reviews[o].rating.service)
      sum_total_recommend += parseInt(restaurant.reviews[o].rating.recommend)
      sum_total_clean += parseInt(restaurant.reviews[o].rating.clean)
    }

    average = sum_total / restaurant.reviews.length //calculate average total
    average_food = sum_total_food / restaurant.reviews.length //calculate average total
    average_service = sum_total_service / restaurant.reviews.length //calculate average total
    average_recommend = sum_total_recommend / restaurant.reviews.length //calculate average total
    average_clean = sum_total_clean / restaurant.reviews.length //calculate average total

    //Check if average return a number
    if(isNaN(average)){
      average = 0
    }
    if(isNaN(average_clean)){
      average_clean = 0
    }
    if(isNaN(average_food)){
      average_food = 0
    }
    if(isNaN(average_service)){
      average_service = 0
    }
    if(isNaN(average_recommend)){
      average_recommend = 0
    }

    let data = {
      average : average,
      food :average_food,
      service : average_service,
      recommend : average_recommend,
      clean : average_clean
    }


    // res.send(restaurant)
    res.render('restaurant/show', { restaurant :restaurant, data : data })
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
exports.new = (req, res)=>{
  res.render('restaurant/new')
}
//create post restaurant request
exports.createRestaurant = (req, res) =>{

  upload(req, res, (err) =>{
    if(err){
      console.log(err);
      req.flash('error', 'File is too Large')
      res.render('restaurant/new')
    }else{
      if(req.file == undefined){
        req.flash('error', 'File is too Large')
        res.render('restaurant/new')
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


  let sum = 0 // sum of all total reviews

  // console.log(which_restaurant);
  let temp = (user_food + user_service + user_recommend + user_clean)/ 4
  let mean = temp.toFixed(1)

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

  let final_rating_num = 0
  //get all total in Reviews
  Review.find({}).select('rating').exec()
  .then((r)=>{

      r.forEach((x)=>{
        //get the sum of all totals
        sum += x.rating.total
      })
      // get average total
      let tmp = sum/r.length
      console.log("tmp :" + tmp);

      final_rating_num = tmp.toFixed(2)
      console.log("final_inside :" + final_rating_num)

      return final_rating_num

  }).then((final_rating_num)=>{
      console.log("final_outside 1 :" + final_rating_num)

      let new_res = {
          $set:{final_rating : final_rating_num},
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
  })

console.log("final_outside :" + final_rating_num)
console.log("sum 1:"+ sum);

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
