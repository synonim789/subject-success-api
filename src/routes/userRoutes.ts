import express from 'express';
import {
   forgotPassword,
   getUser,
   resetPassword,
   setNewPassword,
   signUp,
   updateProfilePicture,
   updateUsername,
} from '../controllers/userController';
import { upload } from '../middleware/multer';
import { verifyJwt } from '../middleware/verifyJWT';

const router = express.Router();

router.get('/', verifyJwt, getUser);
router.post('/sign-up', signUp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.put('/set-new-password', verifyJwt, setNewPassword);
router.put('/update-username', verifyJwt, updateUsername);
router.put(
   '/update-profile-image',
   verifyJwt,
   upload.single('image'),
   updateProfilePicture,
);

export default router;
