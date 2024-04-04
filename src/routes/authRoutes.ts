import express from 'express';
import {
   githubAuth,
   googleAuth,
   login,
   refresh,
} from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.get('/refresh', refresh);
router.get('/google', googleAuth);
router.get('/github', githubAuth);

export default router;
