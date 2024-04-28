import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from '../models/user.models.js';
import {uploadFileToCloudinary } from "../utils/cloudinary.js"

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

export { registerUser,loginUser,logoutUser }