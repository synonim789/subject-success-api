import { z } from 'zod';

export const AddTaskSchema = z.object({
   title: z.string(),
   subjectId: z.string(),
   date: z.string(),
});

export const UpdateTaskTitleSchema = z.object({
   title: z.string(),
   date: z.string().optional(),
});

export const UpdateTaskCompletedSchema = z.object({
   completed: z.boolean(),
});
