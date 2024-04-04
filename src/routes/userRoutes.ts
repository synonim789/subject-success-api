import express from 'express';
import { getUser, signUp } from '../controllers/userController';

const router = express.Router();

router.post('/sign-up', signUp);
router.get('/', getUser);

export default router;
