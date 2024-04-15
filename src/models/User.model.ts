import mongoose, { InferSchemaType, model } from 'mongoose';

const userSchema = new mongoose.Schema(
   {
      username: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String },
      googleId: { type: String },
      githubId: { type: String },
      picture: { type: String },
   },
   { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;

export default model<User>('User', userSchema);
