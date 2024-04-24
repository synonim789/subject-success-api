import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

const subjectSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   status: {
      type: String,
      enum: ['noTasks', 'inProgress', 'completed'],
      required: true,
   },
   type: {
      type: String,
      enum: ['grade', 'completion'],
      required: true,
   },
   grade: {
      type: Number,
   },
   completed: {
      type: Boolean,
   },
   tasks: [
      {
         type: Schema.Types.ObjectId,
         ref: 'Task',
      },
   ],
   user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
   },
});

type Subject = InferSchemaType<typeof subjectSchema>;

export default model<Subject>('Subject', subjectSchema);
