const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tagId = { type: Schema.Types.ObjectId, ref:'Tag' }
const reviewId = { type: Schema.Types.ObjectId, ref: 'Review' }

const restaurantSchema = new Schema({
    location : {
      longitude : { type :String },
      latitude : { type :String },
      address: { type :String },
      city : { type :String },
      country : { type :String }
    },
    name : String,
    description: String,
    image : String,
    cusine : [{type : String}],
    reviews : [reviewId],
    final_rating : Number,
    tags : [tagId],
    created_at :{ type: Date, default : Date.now }

})

restaurantSchema.virtual('fullAddress').get(function () {
  return this.location.address + ', ' + this.location.city + ', ' + this.location.country
});



const Restaurant = mongoose.model('Restaurant', restaurantSchema)
module.exports = Restaurant
