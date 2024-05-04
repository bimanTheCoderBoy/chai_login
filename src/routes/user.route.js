import express from 'express';
import {registerUser,loginUser,logoutUser,updateAccessToken,updatePassword} from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from '../middlewares/auth.middleware.js';
const router = express.Router();

router.route('/register' ).post(
    upload.fields([
        {
            name: 'avtar',
            maxCount: 1
        },
        {
            name: 'coverimage',
            maxCount: 1
        }
    ]),
    registerUser
)

router.post('/login',loginUser)
router.post('/logout',authMiddleware,logoutUser)
router.post('/refresh-token',updateAccessToken)
router.put('/update-password',authMiddleware,updatePassword)

export default router;