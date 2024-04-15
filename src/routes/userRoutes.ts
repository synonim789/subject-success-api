import express from 'express';
import {
   forgotPassword,
   getUser,
   resetPassword,
   signUp,
} from '../controllers/userController';
import { verifyJwt } from '../middleware/verifyJWT';

const router = express.Router();

router.post('/sign-up', signUp);
router.get('/', getUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.get('/user', verifyJwt, getUser);

export default router;
