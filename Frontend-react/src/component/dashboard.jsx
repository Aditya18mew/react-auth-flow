

import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"




export function Dashboard(){
   const navigate=useNavigate()
   const [err,seterr]=useState()
    async function checkauthorization(){
    try{
     const res=await axios.get("http://localhost:5000/api/checkauthorization", {
     withCredentials:true
     })
     if(res.data.success===true){
      navigate("/home")
     }
    }catch(err){
      seterr(err)
    }
 }

 useEffect(()=>{
   checkauthorization()
 },[])

   return (
    <div className='homepage'>
        <div className='icon'></div>
        <h1>Success!</h1>

  </div>
    )
       
    
}