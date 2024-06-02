import express from 'express';
import {
   githubAuth,
   googleAuth,
   login,
   logout,
   refresh,
} from '../controllers/authController';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = express.Router();

router.post('/login', asyncWrapper(login));
router.get('/refresh', asyncWrapper(refresh));
router.get('/google', asyncWrapper(googleAuth));
router.get('/github', asyncWrapper(githubAuth));
router.post('/logout', asyncWrapper(logout));

export default router;
