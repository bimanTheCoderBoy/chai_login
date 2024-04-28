import express from 'express';
import {registerUser,loginUser} from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
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

export default router;