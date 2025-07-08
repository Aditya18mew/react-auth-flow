const mongoose=require("mongoose")


const userSchema = new mongoose.Schema({
    id:String,
    Email:String,
    Password:String,
    otp:String,
    RefreshToken:String,
    CreatedAt:Date,
    ExpiredAt:Date,
})

const unverifieduserschema=mongoose.Schema({
    Email:String,
    Password:String,
    otp:String
})

const User=mongoose.model("user",userSchema)
const unverifiedUser=mongoose.model("unverifieduser",unverifieduserschema)


const connectdb= async ()=>{
  try{
   await mongoose.connect("mongodb://localhost:27017/database")
  }catch(err){
    console.log(err)
    process.exit(1)
  }
}

async function verifyotp(email,otp){
    try{
     const user=await unverifiedUser.findOne({"Email":email})
     if(user.otp===otp){
         const newuser=new User({
        Email:user.Email,
        Password:user.Password,
       })
       await newuser.save()
       await unverifiedUser.findByIdAndDelete(user._id)
        return true
     }else{
        return false
     }
    }catch(err){
        console.log(err)
    }
}







module.exports={verifyotp,unverifiedUser,connectdb,User}


