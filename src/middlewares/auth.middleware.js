import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"



const authMiddleware=asyncHandler(async(req,_,next)=>{
    //getting token from front-end
    const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
   
    if(!token)
    {
        throw new ApiError(401,"Unauthorized user")
    }
    
    //verify token
    const tokenData=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    //checking and getting user
    const user=await User.findById(tokenData?._id)
    if(!user)
    {
        throw new ApiError(400,"Invalid credentials")
    }

    //adding user to request object
    req.user=user
    next()


})

export default authMiddleware