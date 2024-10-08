import mongoose, {
   HydratedDocument,
   InferSchemaType,
   Schema,
   model,
} from 'mongoose';

const userSchema = new mongoose.Schema(
   {
      username: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String },
      googleId: { type: String },
      githubId: { type: String },
      picture: { type: String },
      subjects: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
         },
      ],
   },
   { timestamps: true },
);

export type User = HydratedDocument<InferSchemaType<typeof userSchema>>;

export default model<User>('User', userSchema);
