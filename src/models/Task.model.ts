import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

const taskSchema = new mongoose.Schema({
   title: {
      type: String,
      required: true,
   },
   subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
   },
   completed: {
      type: Boolean,
      default: false,
   },
});

type Task = InferSchemaType<typeof taskSchema>;

export default model<Task>('Task', taskSchema);
