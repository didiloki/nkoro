const Restaurant = require('../models/restaurant')
const Tag = require('../models/tag');
const Review = require('../models/review')
const User = require('../models/user')


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
