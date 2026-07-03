import  mongoose  from 'mongoose'
import credentials from '../config/config.js'

const connectDb = async ()=>{
  await mongoose.connect(credentials.mongo_url)
  console.log("Connected to database successfully")
}

export default connectDb;
