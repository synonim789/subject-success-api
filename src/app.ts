import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import createHttpError from 'http-errors'
import morgan from 'morgan'
import userRoutes from './routes/userRoutes'
import errorHandler from './utils/errorHandler'
const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

app.use('/user', userRoutes)

app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'))
})

app.use(errorHandler)

export default app
