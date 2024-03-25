import cors from 'cors'
import express from 'express'
import createHttpError from 'http-errors'
import morgan from 'morgan'
import errorHandler from './utils/errorHandler'

const app = express()

app.use(cors())
app.use(morgan('dev'))

app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'))
})

app.use(errorHandler)

export default app
