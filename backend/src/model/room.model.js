import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'authUser',
    required : true
  },
  
    roomId : {
      type : String,
      required : true ,
      unique : true
    },
    roomName : {
      type : String,
      required : true,
      trim: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'authUser',
      },
    ],
    isExpire : {
      type : Boolean,
      default : false 
    },
}, { timestamps: true })

const Room = mongoose.model('room', roomSchema)

export default Room
