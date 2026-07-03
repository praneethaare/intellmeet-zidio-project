import mongoose from 'mongoose';

const userAuthSchema = new mongoose.Schema({
  username : {
    type :String,
    required : true,
    unique : true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email : {
    type :String ,
    required: true,
    unique : true,
    lowercase: true,
    trim: true
  },
  password : {
    type : String,
    required : true
  },
  role : {
    type : String ,
    enum : ["admin","user"],
    required: true ,
    default : "user"
  },
  verified :  {
    type : Boolean,
    default : false

  }
}, { timestamps: true })


const authUser = mongoose.model('authUser', userAuthSchema)
export default authUser
