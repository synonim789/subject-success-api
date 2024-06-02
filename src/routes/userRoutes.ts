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
import { authorization } from '../middleware/authorization';
import { upload } from '../middleware/multer';

const router = express.Router();

router.get('/', authorization, getUser);
router.post('/sign-up', signUp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.put('/set-new-password', authorization, setNewPassword);
router.put('/update-username', authorization, updateUsername);
router.put(
   '/update-profile-image',
   authorization,
   upload.single('image'),
   updateProfilePicture,
);

export default router;
