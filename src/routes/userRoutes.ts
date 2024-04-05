import express from 'express';
import {
   forgotPassword,
   getUser,
   resetPassword,
   signUp,
} from '../controllers/userController';

const router = express.Router();

router.post('/sign-up', signUp);
router.get('/', getUser);
router.post('/forgot-password', forgotPassword);
router.put('reset/password', resetPassword);

export default router;
