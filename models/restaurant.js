const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tagId = { type: Schema.Types.ObjectId, ref:'Tag' }
const reviewId = { type: Schema.Types.ObjectId, ref: 'Review' }

const restaurantSchema = new Schema({
    location : {
      address: { type :String },
      city : { type :String },
      country : { type :String }
    },
    points : {
      type: [Number],  // [<longitude>, <latitude>]
      index: '2d'
    },
    name : String,
    description: String,
    image : String,
    menu : [String],
    cuisine : [{type : String}],
    reviews : [reviewId],
    final_rating : Number,
    status: {type: Number, default : 0},
    tags : [tagId],
    created_at :{ type: Date, default : Date.now }

})

restaurantSchema.index({ points: '2d' })
restaurantSchema.virtual('fullAddress').get(function () {
  if(this.location.address == undefined){
    return 'No Precise Address, Check Map'
  }else{
    return this.location.address + ', ' + this.location.city + ', ' + this.location.country
  }

});



const Restaurant = mongoose.model('Restaurant', restaurantSchema)
module.exports = Restaurant
