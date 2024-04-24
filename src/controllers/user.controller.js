import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.middleware.js";

const registerUser = asyncHandler(
    // upload.fields([
    //     {
    //         name: 'avtar',
    //         maxCount: 1
    //     },
    //     {
    //         name: 'coverimage',
    //         maxCount: 1
    //     }
    // ]),
    async (req, res, next) => {

        //get user Details from frontend
        const { password, fullName, email, username } = req.body

        //field validation
        if ([password, fullName, email, username].some((field) => field.trim() === "")) {
            next(new ApiError(400, "Invalid Api Field"))
        }

        //allready exists check
        //cover img, avter check
        //upload them to cloud storage
        //create user object
        //remove password, refresh token from response
        //check for user creation
        //send back to response

    }
)
export { registerUser }