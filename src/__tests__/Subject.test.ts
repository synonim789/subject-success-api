import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app';
import UserModel from '../models/User.model';
import env from '../utils/cleanEnv';

beforeAll(async () => {
   const mongo = await MongoMemoryServer.create();
   const uri = mongo.getUri();
   mongoose.connect(uri);
   const user = await UserModel.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'test@gmail.com',
      username: 'test!1234',
      password: 'Password!1234',
   }); 
});
afterAll(async () => {
   await mongoose.disconnect();
   await mongoose.connection.close();
});

describe('Subject Test', () => {
   describe('Add Subject Test', () => {
      it('should add subject successfully', async () => {
         const addSubjectInput = {
            name: 'Subject',
            type: 'grade',
         };

         const accessToken = jwt.sign(
            { userId: user._id },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .post('/subject')
            .send(addSubjectInput)
            .set('Cookie', [`accessToken=${accessToken}`]);
         expect(response.status).toBe(200);
      });
   });
});
