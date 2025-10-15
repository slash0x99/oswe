const mongoose = require('mongoose')
const {Schema} = mongoose


const commentSchema = new Schema({
    uuid:{
        type:String,
        required:true,
        trim:true
   },
    username:{
        type:String,
        required:true
    },
    text: {
      type: String, 
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
})


const blogSchema = new Schema({
   uuid:{
        type:String,
        required:true,
        trim:true
   },
   title:{
        type:String,
        required:true,
        trim:true
   },
   author:{
    id: { type: Number},
    username:{ type: String},
    email: { type: String}
   },
   content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    comments: {
        type: [commentSchema],
        default: []
    },
    
},  { timestamps: true }
)


module.exports = mongoose.model('Blog',blogSchema)