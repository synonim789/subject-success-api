import 'dotenv/config'
import mongoose from 'mongoose'
import { app } from './app'
import env from './utils/cleanEnv'

const port = env.PORT
const mongoDB = env.MONGO_URI

mongoose
  .connect(mongoDB)
  .then(() => {
    console.log('MongoDB Connected')
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.log(error)
  })
