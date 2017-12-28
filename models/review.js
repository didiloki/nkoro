const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    location : {
      longitude : String,
      latitude : String,
    },
    name : String,
    description: String,
    user : {
      type : Schema.Types.ObjectId,
      ref  : 'User'
    },
    created_at :{
      type: Date,
      default : Date.now
    }

})


const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
