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
import { asyncWrapper } from '../utils/asyncWrapper';

const router = express.Router();

router.get('/', authorization, asyncWrapper(getUser));
router.post('/sign-up', asyncWrapper(signUp));
router.post('/forgot-password', asyncWrapper(forgotPassword));
router.put('/reset-password', asyncWrapper(resetPassword));
router.put('/set-new-password', authorization, asyncWrapper(setNewPassword));
router.put('/update-username', authorization, asyncWrapper(updateUsername));
router.put(
   '/update-profile-image',
   authorization,
   upload.single('image'),
   asyncWrapper(updateProfilePicture),
);

export default router;
