const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    description: String,
    user : {
      type : Schema.Types.ObjectId,
      ref  : 'User'
    },
    rating:{
      food : Number,
      service : Number,
      recommend : Number,
      clean : Number
    },
    created_at :{
      type: Date,
      default : Date.now
    }

})


const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
