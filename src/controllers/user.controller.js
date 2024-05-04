import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from '../models/user.models.js';
import {uploadFileToCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(
   
    async (req, res, next) => {

        //get user Details from frontend
        const { password, fullName, email, username } = req.body


        //field validation
        if ([password, fullName, email, username].some((field) => field.trim() === "")) {
           throw new ApiError(400, "Invalid Api Field")
        }


        //allready exists check
        const existedUser = await User.findOne({ 
            $or:[ { email} , { username } ]
        });

        if (existedUser) {
           throw new ApiError(409, "User Already Exists")
        }



        //cover img, avter check
        const avtarLocalPath=req.files?.avtar[0]?.path
        const coverimgLocalPath=req.files?.coverimage[0]?.path
        if(!avtarLocalPath){
            throw new ApiError(400, "Avtar Is Required")
        }


        //upload them to cloud storage
        const avtar=await uploadFileToCloudinary(avtarLocalPath);
        const coverimg=await uploadFileToCloudinary(coverimgLocalPath);
        if(!avtar ||!coverimg){
            throw new ApiError(500, "Internal Server Error")
        }



        //create user object
        const user = await User.create({
            fullName,
            email,
            username:username.toLowerCase(),
            password,
            avtar:avtar.url,
            coverImage:coverimg.url,
        })
        
        
        //remove password, refresh token from response

        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        //check for user creation
        if(!createdUser){
            throw new ApiError(500, "Some thing went wrong while creating a new user")
        }


        //send back to response
        res.status(201).json(
            new ApiResponse(
             createdUser,
             "User created successfully"
            
            )
        )
    }
)


const loginUser=asyncHandler(async(req,res,next)=>{
    //getting user data from req.body
    //username or email check
    //user exists check
    //password correct check
    //create refresh token
    //create access token
    //send via cookie
    //refresh token send to db
    //send back to response
    const {username,email,password}=req.body;
    if(!username && !email){
        throw new ApiError(400,"Invalid Api Field")
    }


    const user=await User.findOne({
        $or:[
            {username:username?.trim().toLowerCase()},
            {email:email?.trim().toLowerCase()}
        ]
    })
    if(!user){
        throw new ApiError(404,"User Not Found")
    }



    const isPasswordCorrect=await user.isPasswordCorrect(password.toString())
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid Password")
    }


    const refreshToken=user.generateRefreshToken();
    const accessToken=user.generateAccessToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});

    const options={
        httpOnly:true,
        secure:true
    }


   
    res.status(200).
    cookie("refreshToken",refreshToken,options).
    cookie("accessToken",accessToken,options).
    json(
        new ApiResponse(
            {user,refreshToken,accessToken},
            "User Logged In Successfully"
        )   
    )


})

const logoutUser=asyncHandler(async(req, res)=>{
   //unset refresh token from db
   await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset:{refreshToken:1}
    },
    {
        new:true
    }
    )



    const options={
        httpOnly:true,
        secure:true
    }

    //clear the refresh token and access token
    res.
    status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(
        new ApiResponse(
            {},
            "User Logged Out Successfully"
        )
    )
})

const updateAccessToken = asyncHandler(async(req,res)=>{
    //getting refreshToken from frontend
    const {refreshToken} =req.cookies || req.body
    //frontend data validation
    if(!refreshToken){
        throw new ApiError(400,"Invalid credentials")
    }
    //verify token
    const decodedToken= jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);


    //check if token is valid and getting user
    const user=await User.findById(decodedToken?._id);
    if(!user) throw new ApiError(401,"Invalid refresh token");

    //refresh token valodation
    if(user?.refreshToken!=refreshToken) throw new ApiError(401,"Invalid refresh token")

    //making new access token and refresh token
    const newRefreshToken=user.generateRefreshToken();
    const accessToken=user.generateAccessToken();


    //save new refresh token to db
    user.refreshToken=newRefreshToken;
    await user.save({validateBeforeSave:false});


    //send it via cookie
    //send response to frontend
    const options={
        httpOnly:true,
        secure:true
    }
    res.
    status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",newRefreshToken,options).
    json(new ApiResponse({refreshToken:newRefreshToken,accessToken},"Tokens are updated successfully"))
})


const updatePassword=asyncHandler(async(req,res) => {
    //getting user data from req.body
    const {oldPassword,newPassword}=req.body
    // data validation
    if(!oldPassword ||!newPassword){
        throw new ApiError(400,"Invalid Api Field")
    }
    //getting user from db
    const user=await User.findById(req.user._id)
    if(!user){
        throw new ApiError(404,"User Not Found")
    }
    //password correct check
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword.toString())
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid Password")
    }
    //updating password
    user.password= newPassword
   await user.save({validateBeforeSave:false});

   res.status(200).json(new ApiResponse({},"password updated successfully"))
    
})
export { registerUser,loginUser,logoutUser,updateAccessToken,updatePassword }