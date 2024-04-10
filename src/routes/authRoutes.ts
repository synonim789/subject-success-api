import express from 'express';
import {
   githubAuth,
   googleAuth,
   login,
   logout,
   refresh,
} from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.get('/refresh', refresh);
router.get('/google', googleAuth);
router.get('/github', githubAuth);
router.post('/logout', logout);

export default router;
