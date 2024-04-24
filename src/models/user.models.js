import{Schema,model} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "json-web-token"
const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:[true,"userName allready taken"],
            length: [3, 'username must be longer than' ],
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:[true,"email allready taken"],
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
        },
        watchHistory:{
            type:[{
                type:Schema.Types.ObjectId,  
                ref:"Video"
            }]
        },
        avtar:{
            type:String
        },
        coverImage:{
            type:String
        },
        password:{
            type:String,
            required:true,
        },
        refreshToken:{
            type:String
        }
    },
{timestamps:true})


//mongoose hook example
userSchema.pre('save',async function (next) {
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
})

//custom methods
userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function () {
   return jwt.sign(
        {
            _id:this._id,
            fullName:this.fullName,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET
        ,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        })
}

userSchema.methods.generateRefreshToken=function () {
    return jwt.sign(
         {
             _id:this._id,
             
         },
         process.env.REFRESH_TOKEN_SECRET
         ,
         {
             expiresIn:process.env.REFRESH_TOKEN_EXPIRY
         })
 }

export const User=model("User",userSchema)