import { z } from 'zod';

export const AddSubjectSchema = z.object({
   name: z.string().min(1, { message: 'Name Is Required' }),
   type: z.enum(['grade', 'completion']),
});

export const UpdateSubjectSchema = z.object({
   name: z.string().min(1, { message: 'Subject Name Is Required' }),
   type: z.enum(['grade', 'completion']),
   grade: z.number().optional(),
   completed: z.boolean().optional(),
});
