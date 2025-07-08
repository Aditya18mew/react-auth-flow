const express =require("express")
const bcrypt=require("bcrypt")
const cookieParser=require("cookie-parser")
const {verifyotp,unverifiedUser,connectdb,User}=require("./login details/db")
const {validatemail,validatepassword}=require("./regex/regex")
const {bcrypting,comparehashpassword}=require("./bcrypting")
const {generatejwt}=require("./jwttokens")
const {sendresetotpemail}=require("./nodemailer")
const cors =require("cors")
require("dotenv").config()
const {randomInt}=require("crypto")
const { refreshtokens, verifyUser } = require("./middleware")




const server=express()
server.use(cookieParser())
server.use(express.json())
server.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
connectdb()


server.get("/api/checkauthorization",refreshtokens,verifyUser, async (req,res)=>{
    res.json({success:true})
} )

server.post("/api/signin",refreshtokens,verifyUser,async (req,res)=>{
  const {email,password}=req.body
if(validatemail(email)){
if(!validatepassword(password)){
    return res.json({success:false,message:"Password must have 8 characters including 1 uppercase or lowercase alphabet and 1 digit"})
}else{
let olduser=await User.findOne({Email:email})

if(!olduser){
    return res.status(401).json({success:false,message:"No such account exist"})
} else {

 const  {passwordmatch,AccessToken,RefreshToken}= await comparehashpassword(email,password,olduser.Password)

 if(passwordmatch===true) {
      res.cookie("MovieappAccessToken",AccessToken,{
        maxAge:15*60*1000,
        path:"/",
        secure:process.env.NODE_ENV==="production",
        httpOnly:true,
        sameSite:"lax"
     })
     res.cookie("MovieappRefreshToken",RefreshToken,{
        maxAge:60*60*24*7*1000,
        path:"/",
        secure:false,
        httpOnly:true,
        sameSite:"lax"
     })
    return res.status(200).json({success:true,message:"login succesful"})
 } else {
    return res.status(401).json({success:false,message:"incorrect password"})
 }
}
}
}else{
    return res.status(401).json({success:false,message:"invalid email"})
} 
})

server.post("/api/verifyotp",async (req,res)=>{
    try{
       const {email,otp}=req.body
     const result=await verifyotp(email,otp)
     if(result===true){
    const {AccessToken,RefreshToken}=await generatejwt(email)
     res.cookie("MovieappAccessToken",AccessToken,{
        maxAge:15*60*1000,
        path:"/",
        secure:false,
        httpOnly:true,
        sameSite:"lax"
     })

     res.cookie("MovieappRefreshToken",RefreshToken,{
        maxAge:60*60*24*7*1000,
        path:"/",
        secure:false,
        httpOnly:true,
        sameSite:"lax"
     })
      return res.json({success:true,message:"sign-up successful"})
     }else{
        return res.json({success:false,message:"Incorrect otp"})
     }
    }catch(err){
        console.log(err)
    }
})

server.get("/api/logout",refreshtokens,verifyUser, async (req,res)=>{
    const {Email}=req.user
     try{
        const user=await User.findOne({"Email":Email})
        res.clearCookie("MovieappAccessToken",{
        path:"/",
        secure:false,
        httpOnly:true,
        sameSite:"lax"
     })

     res.clearCookie("MovieappRefreshToken",{
        path:"/",
        secure:false,
        httpOnly:true,
        sameSite:"lax"
     })

        user.RefreshToken=""
        user.CreatedAt=null
        user.ExpiredAt=null
        await user.save()
        return res.json({success:true,message:"logout successful"})
     }catch(err){
        return res.json({success:false,message:"logout unsuccessful"})
     }
})

server.post("/api/signup",async (req,res)=>{
    try{
    const {email,password}=req.body
    if(validatemail(email)){
       if(!validatepassword(password)){
      return res.json({success:false,message:"Password must have 8 characters including 1 uppercase or lowercase alphabet and 1 digit"})
       }else{
        let olduser=await User.findOne({Email:email})
    if(!olduser){
   const {success}=await bcrypting(email,password)
    return res.status(201).json({success:success,message:"otp sended via mail"})
}else{
    return res.status(409).json({success:false,message:`${email} already in use`})
}

}
}else{
     return res.json({success:false,message:"invalid email"})
    }
}catch(err){
    console.log(err)
}
})

server.post("/api/forgetpassword",async (req,res)=>{
    const {email}=req.body
    if(validatemail(email)){
        let User=await User.findOne({Email:email})
         if(!User){
            res.json({success:false,message:`No account with ${email} email`})
         }else{
            const otp=randomInt(100000,999999).toString()
            let iserror=await sendresetotpemail(email,otp)
         if(iserror){
            res.json({success:false,message:"Unable to send a email"})
         }else{
           res.json({success:true,message:`Email with a reset otp has been sent`})
         }
        }
    }else{
        return res.json({success:false,message:"invalid email"})
       }
})

server.post("/api/verifyresetotp",async (req,res)=>{
    try{
       const {email,otp}=req.body
     const user=await User.findOne({"Email":email})
     if(user.otp===otp){
      return res.json({success:true,message:"sign-up successful"})
     }else{
        return res.json({success:false,message:"Incorrect otp"})
     }
    }catch(err){
        console.log(err)
    }
})

server.post("/api/resetpassword",async (req,res)=>{
    const {newpass,confirmnewpass,email}=req.body
    const foundUser=await User.findOne({Email:email})
    if(!foundUser){
        return res.json({success:false,message:"No such account exist"})
    }else{
        if(!validatepassword(newpass)){
            return res.json({success:false,message:"new-Password must have 8 characters including 1 uppercase or lowercase alphabet and 1 digit"})
        }else{
            if(!validatepassword(confirmnewpass)){
                return res.json({success:false,message:"confirm new-Password must have 8 characters including 1 uppercase or lowercase alphabet and 1 digit"})
            }else if(newpass!==confirmnewpass){
               return res.json({success:false,message:"confirm new-password does not match with new-password"})
            }else{
                const hasspassword=await bcrypt.hash(newpass,10)
                foundUser.Password=hasspassword
                await foundUser.save()
                res.json({success:true,message:"password has been reset"})
            }
        }
    }
   
})





server.listen(5000,()=>{
    console.log("server is running")
})