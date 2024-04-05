import mongoose, { InferSchemaType, model } from 'mongoose';

const otpSchema = new mongoose.Schema({
   email: {
      type: String,
      required: true,
   },
   otp: {
      type: Number,
      required: true,
      unique: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 10,
   },
});

type Otp = InferSchemaType<typeof otpSchema>;

export default model<Otp>('Otp', otpSchema);
