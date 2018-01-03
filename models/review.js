const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    description: String,
    user : {
      type : Schema.Types.ObjectId,
      ref  : 'User'
    },
    rating:{
      food : { type : Number, default : 0},
      service : { type : Number, default : 0},
      recommend : { type : Number, default : 0},
      clean : { type : Number, default : 0},
      total : { type : Number, default : 0}
    },
    created_at :{
      type: Date,
      default : Date.now
    }

})


const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
