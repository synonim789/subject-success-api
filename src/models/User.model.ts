import mongoose, { InferSchemaType, model } from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

type User = InferSchemaType<typeof userSchema>

export default model<User>('User', userSchema)
