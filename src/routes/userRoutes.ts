import express from 'express'
import { getUser, login, refresh, signUp } from '../controllers/userController'

const router = express.Router()

router.post('/sign-up', signUp)
router.post('/login', login)
router.get('/refresh', refresh)
router.get('/', getUser)

export default router
