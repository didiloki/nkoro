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
    reviews : [reviewId],
    tags : [tagId],
    rating : {
        food : Number,
        service : Number,
        recommend : Number,
        clean : Number
    },
    created_at :{ type: Date, default : Date.now }

})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)
module.exports = Restaurant
