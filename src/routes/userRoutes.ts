import express from 'express'
import { login, signUp } from '../controllers/userController'

const router = express.Router()

router.post('/sign-up', signUp)
router.post('/login', login)

export default router
