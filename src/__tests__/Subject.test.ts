// import jwt from 'jsonwebtoken';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import mongoose from 'mongoose';
// import supertest from 'supertest';
// import app from '../app';
// import UserModel from '../models/User.model';
// import env from '../utils/cleanEnv';

import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app';
import SubjectModel from '../models/Subject.model';
import TaskModel from '../models/Task.model';
import { createAndLoginUser } from '../utils/loginHelper';

let accessToken: string;
let user: any;

beforeAll(async () => {
   const { accessToken: token, user: userFromHelper } =
      await createAndLoginUser();
   accessToken = token;
   user = userFromHelper;
});

describe('Subject Test', () => {
   beforeEach(async () => {
      await SubjectModel.deleteMany({});
      await TaskModel.deleteMany({});
   });

   describe('Add Subject', () => {
      it('should return 200 status when task is added', async () => {
         const { statusCode, body } = await supertest(app)
            .post('/subject')
            .send({ name: 'Test Subject', type: 'completion' })
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.name).toBe('Test Subject');
         expect(body.type).toBe('completion');
      });
   });

   describe('Update Subject', () => {
      const updatedSubject = {
         name: 'Advanced Math',
         type: 'grade',
         grade: 4,
      };
      it('should return 200 and json with updated subject', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: user._id,
            status: 'noTasks',
         });
         await subject.save();

         const { statusCode, body } = await supertest(app)
            .put(`/subject/${subject._id}`)
            .send(updatedSubject)
            .set('Cookie', `accessToken=${accessToken}`);

         expect(statusCode).toBe(200);
         expect(body.name).toBe('Advanced Math');
         expect(body.type).toBe('grade');
         expect(body.grade).toBe(4);
      });
      it('should return status 400 and message if subject id is invalid', async () => {
         const { statusCode, body } = await supertest(app)
            .put('/subject/1234')
            .send(updatedSubject)
            .set('Cookie', `accessToken=${accessToken}`);

         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid Subject Id');
      });
      it('should return status 400 and message if subject is not found', async () => {
         const id = new mongoose.Types.ObjectId();
         const { statusCode, body } = await supertest(app)
            .put(`/subject/${id}`)
            .send(updatedSubject)
            .set('Cookie', `accessToken=${accessToken}`);

         expect(statusCode).toBe(404);
         expect(body.message).toBe('Subject not found');
      });
      it('should return status 403 and message if subject does not belong to user', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: new mongoose.Types.ObjectId(),
            status: 'noTasks',
         });

         await subject.save();

         const { statusCode, body } = await supertest(app)
            .put(`/subject/${subject._id}`)
            .send(updatedSubject)
            .set('Cookie', `accessToken=${accessToken}`);

         expect(statusCode).toBe(403);
         expect(body.message).toBe('No Permission to update this subject');
      });
   });

   describe('Delete Subject', () => {
      it('should return status 200 and message if deleting is successfull', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: user._id,
            status: 'noTasks',
         });

         await subject.save();

         const { statusCode, body } = await supertest(app)
            .delete(`/subject/${subject._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.message).toBe('Subject removed successfully');
      });
      it('should return status 400 and message if subjectId is invalid', async () => {
         const id = 1111;

         const { statusCode, body } = await supertest(app)
            .delete(`/subject/${id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid subject id');
      });
      it('should return status 404 and message if task is not found', async () => {
         const id = new mongoose.Types.ObjectId();
         const { statusCode, body } = await supertest(app)
            .delete(`/subject/${id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(404);
         expect(body.message).toBe('Subject not found');
      });
      it('should return status 403 and message if subject does not belong to user', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: new mongoose.Types.ObjectId(),
            status: 'noTasks',
         });

         await subject.save();

         const { statusCode, body } = await supertest(app)
            .delete(`/subject/${subject._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(403);
         expect(body.message).toBe('No Permission to delete this subject');
      });
   });

   describe('Get All Subjects', () => {
      it('should return 200 and subjects if everything is successfull', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: user._id,
            status: 'noTasks',
         });

         await subject.save();

         const { statusCode, body } = await supertest(app)
            .get('/subject')
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.length).toBe(1);
         expect(body[0].name).toBe(subject.name);
      });
   });
   describe('Get Subject By Id', () => {
      it('should return status 200 and single subject if everything is successfull', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: user._id,
            status: 'noTasks',
         });

         await subject.save();

         const { statusCode, body } = await supertest(app)
            .get(`/subject/${subject._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body.name).toBe(subject.name);
      });
      it('should return status 400 and message if subjectId is invalid', async () => {
         const { statusCode, body } = await supertest(app)
            .get('/subject/444')
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(400);
         expect(body.message).toBe('Invalid subject id');
      });
      it('should return status 404 and message if subject is not found', async () => {
         const id = new mongoose.Types.ObjectId();
         const { statusCode, body } = await supertest(app)
            .get(`/subject/${id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(404);
         expect(body.message).toBe('Subject not found');
      });
      it('should return status 403 and message if subject does not belong to user', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: new mongoose.Types.ObjectId(),
            status: 'noTasks',
         });

         await subject.save();

         const { statusCode, body } = await supertest(app)
            .get(`/subject/${subject._id}`)
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(403);
         expect(body.message).toBe('No permission to get task');
      });
   });
   describe('Get Recommended Subjects', () => {
      it('should return status 200 and json with recommended tasks', async () => {
         const subject = new SubjectModel({
            name: 'Math',
            type: 'completion',
            user: user._id,
            status: 'noTasks',
         });

         await subject.save();
         const { statusCode, body } = await supertest(app)
            .get('/subject/recommended')
            .set('Cookie', `accessToken=${accessToken}`);
         expect(statusCode).toBe(200);
         expect(body[0].name).toBe(subject.name);
      });
   });
});
