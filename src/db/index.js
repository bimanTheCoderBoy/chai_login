import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export  const dbConnect=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("MongoDB Connected:: HOST :=: ",connectionInstance.connection.host);
    } catch (error) {
       throw Error("DB Connection Error " );
    }
}