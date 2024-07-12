import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app';
import SubjectModel from '../models/Subject.model';
import TaskModel from '../models/Task.model';
import { createAndLoginUser } from '../utils/loginHelper';

let accessToken: string;
let user: any;
let subjectId: string;
const date = new Date().toISOString();

beforeAll(async () => {
   const { accessToken: token, user: userFromHelper } =
      await createAndLoginUser();
   accessToken = token;
   user = userFromHelper;
   const subject = new SubjectModel({
      name: 'English',
      type: 'completion',
      user: user._id,
      status: 'noTasks',
   });
   await subject.save();
   subjectId = subject._id.toString();
});

describe('Task Test', () => {
   beforeEach(async () => {
      await TaskModel.deleteMany({});
   });
   describe('Add Task Test', () => {
      it('should return status 200 and task if everything is successfull', async () => {
         const newTask = {
            title: 'Task',
            subjectId: subjectId,
            date,
         };

         const { statusCode, body } = await supertest(app)
            .post('/task')
            .set('Cookie', `accessToken=${accessToken}`)
            .send(newTask);
         expect(statusCode).toBe(200);
         expect(body.title).toBe(newTask.title);
      });
      it('should return status 400 and message if subjectId is invalid', async () => {
         const newTask = {
            title: 'Task',
            subjectId: '1234',
            date,
         };
         const { statusCode, body } = await supertest(app)
            .post('/task')
            .set('Cookie', `accessToken=${accessToken}`)
            .send(newTask);
         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid Subject Id');
      });
      it('should return status 404 and message if subject is not found', async () => {
         const newTask = {
            title: 'Task',
            subjectId: new mongoose.Types.ObjectId(),
            date,
         };
         const { statusCode, body } = await supertest(app)
            .post('/task')
            .set('Cookie', `accessToken=${accessToken}`)
            .send(newTask);
         expect(statusCode).toBe(404);
         expect(body.message).toBe('Task not found');
      });
   });
   describe('Update Task Title', () => {
      it('should return status 200 and task if everything is successful', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: user._id,
            subject: subjectId,
            completed: false,
         });

         const updatedTask = {
            title: 'Updated Task',
         };

         const { statusCode, body } = await supertest(app)
            .put(`/task/title/${task._id}`)
            .send(updatedTask)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.title).toBe(updatedTask.title);
      });
      it('should return status 400 and message if taskId is invalid', async () => {
         const updatedTask = {
            title: 'Updated Task',
         };
         const { statusCode, body } = await supertest(app)
            .put(`/task/title/1234`)
            .send(updatedTask)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid Task Id');
      });
      it('should return status 404 and message if task is not found', async () => {
         const id = new mongoose.Types.ObjectId();

         const newTask = {
            title: 'Updated Task',
         };

         const { statusCode, body } = await supertest(app)
            .put(`/task/title/${id}`)
            .set('Cookie', `accessToken=${accessToken}`)
            .send(newTask);
         expect(statusCode).toBe(404);
         expect(body.message).toBe('Task Not found');
      });
      it('should return status 403 and message if task does not belong to user', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: new mongoose.Types.ObjectId(),
            subject: subjectId,
            completed: false,
         });

         const updatedTask = {
            title: 'Updated Task',
         };

         const { statusCode, body } = await supertest(app)
            .put(`/task/title/${task._id}`)
            .set('Cookie', `accessToken=${accessToken}`)
            .send(updatedTask);
         expect(statusCode).toBe(403);
         expect(body.message).toBe('No permission to edit this task');
      });
   });
   describe('Update Task Completed', () => {
      it('should return status 200 and task if everything is successful', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: user._id,
            subject: subjectId,
            completed: false,
         });
         const updated = {
            completed: true,
         };
         const { body, statusCode } = await supertest(app)
            .put(`/task/completed/${task._id}`)
            .set('Cookie', `accessToken=${accessToken}`)
            .send(updated);
         expect(statusCode).toBe(200);
         expect(body.completed).toBe(updated.completed);
      });
      it('should return status 400 and message if taskId is invalid', async () => {
         const updated = {
            completed: true,
         };
         const { body, statusCode } = await supertest(app)
            .put(`/task/completed/1234`)
            .set('Cookie', `accessToken=${accessToken}`)
            .send(updated);
         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid Task Id');
      });
      it('should return status 404 and message if task is not found', async () => {
         const id = new mongoose.Types.ObjectId();

         const updated = {
            completed: true,
         };

         const { statusCode, body } = await supertest(app)
            .put(`/task/completed/${id}`)
            .set('Cookie', `accessToken=${accessToken}`)
            .send(updated);
         expect(statusCode).toBe(404);
         expect(body.message).toBe('Task not found');
      });
      it('should return status 403 and message if task does not belong to user', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: new mongoose.Types.ObjectId(),
            subject: subjectId,
            completed: false,
         });

         const updatedTask = {
            completed: true,
         };

         const { statusCode, body } = await supertest(app)
            .put(`/task/completed/${task._id}`)
            .set('Cookie', `accessToken=${accessToken}`)
            .send(updatedTask);
         expect(statusCode).toBe(403);
         expect(body.message).toBe('No permission to edit this task');
      });
   });
   describe('Delete Task', () => {
      it('should return status 200 and message if everything is successful', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: user._id,
            subject: subjectId,
            completed: false,
         });

         const { statusCode, body } = await supertest(app)
            .delete(`/task/${task._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.message).toBe('Task removed successfully');
      });
      it('should return status 400 and message if taskId is invalid', async () => {
         const { body, statusCode } = await supertest(app)
            .delete(`/task/1234`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid Task Id');
      });
      it('should return status 404 and message if task is not found', async () => {
         const id = new mongoose.Types.ObjectId();

         const { statusCode, body } = await supertest(app)
            .delete(`/task/${id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(404);
         expect(body.message).toBe('Task not found');
      });
      it('should return status 403 and message if task does not belong to user', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: new mongoose.Types.ObjectId(),
            subject: subjectId,
            completed: false,
         });

         const { statusCode, body } = await supertest(app)
            .delete(`/task/${task._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(403);
         expect(body.message).toBe('No permission to delete this task');
      });
   });
   describe('Get All Task', () => {
      it('should return status 200 and message tasks if everything is successful', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: user._id,
            subject: subjectId,
            completed: false,
         });

         const { statusCode, body } = await supertest(app)
            .get('/task')
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body[0].title).toBe(task.title);
      });
   });
   describe('Get Task By Id', () => {
      it('should return status 200 and task if everything is successful', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: user._id,
            subject: subjectId,
            completed: false,
         });
         const { statusCode, body } = await supertest(app)
            .get(`/task/${task._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.title).toBe(task.title);
      });
      it('should return status 400 and message if taskId is invalid', async () => {
         const { body, statusCode } = await supertest(app)
            .get(`/task/1234`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid Task Id');
      });
      it('should return status 404 and message if task is not found', async () => {
         const id = new mongoose.Types.ObjectId();

         const { statusCode, body } = await supertest(app)
            .get(`/task/${id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(404);
         expect(body.message).toBe('Task not found');
      });
      it('should return status 403 and message if task does not belong to user', async () => {
         const task = await TaskModel.create({
            title: 'Task',
            user: new mongoose.Types.ObjectId(),
            subject: subjectId,
            completed: false,
         });

         const { statusCode, body } = await supertest(app)
            .get(`/task/${task._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(403);
         expect(body.message).toBe('No permission to access this task');
      });
   });
   describe('Get Task With Dates', () => {
      it('should return status 200 and task where dates are not null', async () => {
         const task = await TaskModel.create({
            title: 'Task 1',
            user: user._id,
            subject: subjectId,
            completed: false,
            date: new Date().toISOString(),
         });
         const { statusCode, body } = await supertest(app)
            .get('/task/dates')
            .set('Cookie', `accessToken=${accessToken}`);

         expect(statusCode).toBe(200);
         expect(body[0].title).toBe(task.title);
      });
   });
   describe('Get Task Count and Task Completed', () => {
      it('should return status 200 count of task and count of completedTasks', async () => {
         await TaskModel.create([
            {
               title: 'Task 1',
               user: user._id,
               subject: subjectId,
               completed: true,
            },
            {
               title: 'Task 2',
               user: user._id,
               subject: subjectId,
               completed: false,
            },
         ]);
         const { statusCode, body } = await supertest(app)
            .get('/task/completed')
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.taskAmount).toBe(2);
         expect(body.completedTasks).toBe(1);
      });
   });
   describe('Get Recommended Tasks', () => {
      it('should return status 200 and 3 tasks', async () => {
         await TaskModel.create([
            {
               title: 'Task 1',
               user: user._id,
               subject: subjectId,
               completed: false,
               date: new Date().toISOString(),
            },
            {
               title: 'Task 2',
               user: user._id,
               subject: subjectId,
               completed: false,
               date: new Date().toISOString(),
            },
            {
               title: 'Task 3',
               user: user._id,
               subject: subjectId,
               completed: false,
               date: new Date().toISOString(),
            },
            {
               title: 'Task 4',
               user: user._id,
               subject: subjectId,
               completed: false,
               date: new Date().toISOString(),
            },
         ]);
         const { statusCode, body } = await supertest(app)
            .get('/task/recommended')
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body).toHaveLength(3);
      });
   });
   describe('Remove All Tasks', () => {
      it('should return message and status 200 if everything is successful', async () => {
         await TaskModel.create({
            title: 'Task',
            user: user._id,
            subject: subjectId,
            completed: false,
         });
         await TaskModel.create({
            title: 'Task 2',
            user: user._id,
            subject: subjectId,
            completed: false,
         });

         const response = await supertest(app)
            .delete('/task/all')
            .set('Cookie', `accessToken=${accessToken}`);
         expect(response.status).toBe(200);
         expect(response.body).toEqual({
            message: 'Tasks deleted successfully',
         });
      });
   });
});
