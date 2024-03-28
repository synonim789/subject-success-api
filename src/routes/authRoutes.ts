import express from 'express'
import { googleAuth, login, refresh } from '../controllers/authController'

const router = express.Router()

router.post('/login', login)
router.get('/refresh', refresh)
router.get('/google', googleAuth)

export default router
