import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import path from 'path';
import supertest from 'supertest';
import app from '../app';
import OtpModel from '../models/Otp.model';
import UserModel from '../models/User.model';
import env from '../utils/cleanEnv';

const singUpInput = {
   _id: new mongoose.Types.ObjectId(),
   email: 'text@example.com',
   username: 'John Doe',
   password: 'Test12345!',
};

const logInInput = {
   email: 'text@example.com',
   password: 'Test12345!',
};

const testImagePath = path.resolve(__dirname, 'test.jpg');

beforeAll(async () => {
   const mongo = await MongoMemoryServer.create();
   const uri = mongo.getUri();
   mongoose.connect(uri);
});
afterAll(async () => {
   await mongoose.disconnect();
   await mongoose.connection.close();
});

describe('User Routes test', () => {
   describe('Sign Up Test', () => {
      it('should return with a 201 status code with User "${user.username} created" message', async () => {
         const { statusCode, body } = await supertest(app)
            .post('/user/sign-up')
            .send(singUpInput);
         expect(statusCode).toBe(201);
         expect(body.message).toEqual(
            `${singUpInput.username} created! Welcome now you have to log in`,
         );
      });

      it("Should return with a 400 status and 'all fields must be filled' message", async () => {
         const { body, statusCode } = await supertest(app)
            .post('/user/sign-up')
            .send({ ...singUpInput, password: '' });
         expect(statusCode).toBe(400);
         expect(body.message).toEqual('All fields must be filled');
      });

      it("Should return with a 400 status and 'Not valid Email' message", async () => {
         const { body, statusCode } = await supertest(app)
            .post('/user/sign-up')
            .send({ ...singUpInput, email: 'test.gmail.com' });
         expect(statusCode).toBe(400);
         expect(body.message).toEqual('Not valid Email');
      });

      it("Should return with a 400 status and 'Password not strong enough.' message", async () => {
         const { body, statusCode } = await supertest(app)
            .post('/user/sign-up')
            .send({ ...singUpInput, password: 'test' });
         expect(statusCode).toBe(400);
         expect(body.message).toEqual('Password not strong enough.');
      });

      it("Should return with a 409 status and 'Username already taken' message", async () => {
         const { body, statusCode } = await supertest(app)
            .post('/user/sign-up')
            .send({ ...singUpInput, email: 'test2@gmail.com' });
         expect(statusCode).toBe(409);
         expect(body.message).toEqual('Username already taken');
      });

      it("Should return with a 409 status and 'Email already taken' message", async () => {
         const { body, statusCode } = await supertest(app)
            .post('/user/sign-up')
            .send({ ...singUpInput, username: 'test2' });
         expect(statusCode).toBe(409);
         expect(body.message).toEqual('Email already taken');
      });
   });
   describe('Login test', () => {
      it('should return with a 201 status code with user payload and set cookies', async () => {
         const { statusCode, body, headers } = await supertest(app)
            .post('/auth/login')
            .send(logInInput);
         expect(statusCode).toBe(201);
         expect(body).toBeTruthy();
         expect(headers['set-cookie']).toBeDefined();
      });
      it("Should return with a 400 status and 'Please provide both email and password to proceed' message", async () => {
         const { statusCode, body } = await supertest(app)
            .post('/auth/login')
            .send({});
         expect(statusCode).toBe(400);
         expect(body.message).toEqual(
            'Please provide both email and password to proceed',
         );
      });
      it("Should return with a 401 status and 'Invalid email or password' message", async () => {
         const { statusCode, body } = await supertest(app)
            .post('/auth/login')
            .send({ ...logInInput, email: 'test2@gmail.com' });
         expect(statusCode).toBe(401);
         expect(body.message).toEqual('Invalid email or password');
      });
      it("Should return with a 401 status and 'Invalid email or password' message", async () => {
         const { statusCode, body } = await supertest(app)
            .post('/auth/login')
            .send({ ...logInInput, password: 'test' });
         expect(statusCode).toBe(401);
         expect(body.message).toEqual('Invalid email or password');
      });
   });
   describe('Refresh Token Test', () => {
      it('Should return a new access token when the refresh token is valid', async () => {
         const user = await UserModel.findOne({
            email: logInInput.email,
         }).exec();
         const mockedRefreshToken = jwt.sign(
            { userId: user?._id },
            env.REFRESH_TOKEN_SECRET,
         );
         const { statusCode, body } = await supertest(app)
            .get('/auth/refresh')
            .set('Cookie', `refreshToken=${mockedRefreshToken}`);
         expect(statusCode).toBe(201);
         expect(body).toEqual({ isAuthenticated: true });
      });

      // it('Should return a 401 status and "Unauthorized" message when there is no cookie', async () => {
      //    const { statusCode, body } = await supertest(app).get('/auth/refresh');
      //    expect(statusCode).toBe(401);
      //    expect(body.message).toEqual('Unauthorized');
      // });

      it('Should return a 403 if the refresh token is invalid', async () => {
         const { statusCode, body } = await supertest(app)
            .get('/auth/refresh')
            .set('Cookie', 'refreshToken=invalid');
         expect(statusCode).toBe(403);
         expect(body.message).toEqual('Forbidden');
      });

      it('Should return a 401 if the user is not found', async () => {
         const userId = new mongoose.Types.ObjectId().toString();
         const mockedRefreshToken = jwt.sign(
            { userId: userId },
            env.REFRESH_TOKEN_SECRET,
         );
         const { statusCode, body } = await supertest(app)
            .get('/auth/refresh')
            .set('Cookie', `refreshToken=${mockedRefreshToken}`);
         expect(statusCode).toBe(401);
         expect(body.message).toEqual('Unauthorized');
      });
   });
   describe('Logout Test', () => {
      it('respond with 204 if resreshToken cookie is not present', async () => {
         const response = await supertest(app).post('/auth/logout');
         expect(response.status).toBe(204);
      });

      it('should respond with 201 and remove access token if refreshToken is valid', async () => {
         const validRefreshToken = 'valid_refresh_token';
         const validAccessToken = 'valid_access_token';
         const userId = 'valid_user_id';
         const response = await supertest(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${validRefreshToken}`]);
         expect(response.status).toBe(200);
      });
   });

   describe('Get User Test', () => {
      it('should return user data and 200 status if token is valid ', async () => {
         const userData = {
            _id: new mongoose.Types.ObjectId(),
            username: 'testUser',
            email: 'test@example.com',
         };
         await UserModel.create(userData);

         const token = jwt.sign(
            { userId: userData._id },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .get('/user')
            .set('Cookie', [`accessToken=${token}`]);
         expect(response.status).toBe(200);

         expect(response.body).toEqual(
            expect.objectContaining({
               username: 'testUser',
               email: 'test@example.com',
            }),
         );
      });

      it('should return 401 if token is missing', async () => {
         const response = await supertest(app).get('/user');
         expect(response.status).toBe(401);
      });

      it('should return 400 if there is no userId in token', async () => {
         const accessToken = jwt.sign({ userId: '' }, env.ACCESS_TOKEN_SECRET);
         const response = await supertest(app)
            .get('/user')
            .set('Cookie', [`accessToken=${accessToken}`]);
         expect(response.status).toBe(400);
         expect(response.body).toEqual({ message: 'No UserId in token' });
      });
      it('should return 404 if user is not found', async () => {
         const accessToken = jwt.sign(
            { userId: new mongoose.Types.ObjectId() },
            env.ACCESS_TOKEN_SECRET,
         );
         const response = await supertest(app)
            .get('/user')
            .set('Cookie', [`accessToken=${accessToken}`]);
         expect(response.status).toBe(404);
         expect(response.body).toEqual({ message: 'User not found' });
      });
   });

   describe('Forgot Password Test', () => {
      it('should send email for password reset', async () => {
         const respose = await supertest(app)
            .post('/user/forgot-password')
            .send({ email: 'test@example.com' });
         expect(respose.status).toBe(200);
         expect(respose.body).toEqual({ message: 'Email sent' });
      });

      it('should return 401 if email is not provided', async () => {
         const response = await supertest(app).post('/user/forgot-password');
         expect(response.status).toBe(401);
         expect(response.body).toEqual({ message: 'Email was not provided' });
      });

      it('should return 404 if user is not found', async () => {
         const response = await supertest(app)
            .post('/user/forgot-password')
            .send({ email: 'test2@example.com' });
         expect(response.status).toEqual(404);
      });
      it('should return 403 if user is registered by github or google', async () => {
         const userData = {
            _id: new mongoose.Types.ObjectId(),
            email: 'test3@example.com',
            googleId: '1234',
            githubId: '1234',
            username: 'test12334566789',
         };
         await UserModel.create(userData);

         const response = await supertest(app)
            .post('/user/forgot-password')
            .send({ email: 'test3@example.com' });
         expect(response.status).toBe(403);
      });

      it('should return 400 if otp for email already exist', async () => {
         const respose = await supertest(app)
            .post('/user/forgot-password')
            .send({ email: 'test@example.com' });
         expect(respose.status).toBe(400);
         expect(respose.body).toEqual({
            message: 'Otp for this email already exist',
         });
      });
   });

   describe('Reset Password Test', () => {
      it('should reset password successfully', async () => {
         const testUser = new UserModel({
            email: 'test4@gmail.com',
            username: 'test!12345678@@3',
         });
         await testUser.save();
         const otp = '1234';
         const testOtp = new OtpModel({ otp, email: testUser.email });
         testOtp.save();
         const newPassword = 'newPassword123';
         const response = await supertest(app)
            .put('/user/reset-password')
            .send({
               otp,
               password: newPassword,
               confirmPassword: newPassword,
            });
         expect(response.status).toBe(200);
         expect(response.body).toEqual({
            message: 'Password updated successfully',
         });
      });

      it('should return 400 if otp is not provided', async () => {
         const response = await supertest(app)
            .put('/user/reset-password')
            .send({
               password: 'Password!1234',
               confirmPassword: 'Password!1234',
            });
         expect(response.status).toBe(400);
         expect(response.body).toEqual({ message: 'OTP Required' });
      });
      it('should return 400 if otp is invalid', async () => {
         const response = await supertest(app)
            .put('/user/reset-password')
            .send({
               otp: '1237',
               password: 'Password!1234',
               confirmPassword: 'Password!1234',
            });
         expect(response.status).toBe(400);
         expect(response.body).toEqual({ message: 'Invalid OTP' });
      });
      it('should return 400 if passwords do not match', async () => {
         const response = await supertest(app)
            .put('/user/reset-password')
            .send({
               otp: '1234',
               password: 'Password!123',
               confirmPassword: 'Password!1234',
            });
         expect(response.status).toBe(400);
         expect(response.body).toEqual({ message: 'Passwords do not match' });
      });

      it('should return 400 if password are not provided', async () => {
         const response = await supertest(app)
            .put('/user/reset-password')
            .send({ otp: 1234 });
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            message: 'password and confirm password are required',
         });
      });

      it('should return 404 if user is not found', async () => {
         await UserModel.deleteOne({ email: 'test4@gmail.com' });
         const response = await supertest(app)
            .put('/user/reset-password')
            .send({
               otp: '1234',
               password: 'Password!12345',
               confirmPassword: 'Password!12345',
            });
         expect(response.status).toBe(404);
         expect(response.body).toEqual({ message: 'User not found' });
      });
   });

   describe('Set New Password Test', () => {
      it('should set new password successfully', async () => {
         const user = await UserModel.findOne({ email: 'test@example.com' });
         const accessToken = jwt.sign(
            { userId: user?._id },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .put('/user/set-new-password')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({
               confirmPassword: 'Password!12345',
               password: 'Password!12345',
            });
         expect(response.status).toBe(200);
         expect(response.body).toEqual({
            message: 'Password updated successfully',
         });
      });
      it('should return 400 if password and confirm password are not provided', async () => {
         const user = await UserModel.findOne({
            email: 'test@example.com',
         });
         const accessToken = jwt.sign(
            { userId: user?._id },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .put('/user/set-new-password')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({});
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            message: 'password and confirm password are required',
         });
      });

      it('should return 400 if passwords do not match', async () => {
         const user = await UserModel.findOne({
            email: 'test@example.com',
         });
         const accessToken = jwt.sign(
            { userId: user?._id },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .put('/user/set-new-password')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({
               confirmPassword: 'Password!1234',
               password: 'Password!12345',
            });
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            message: 'Passwords do not match',
         });
      });

      it('should return 400 if there is no userId in token', async () => {
         const accessToken = jwt.sign({ userId: '' }, env.ACCESS_TOKEN_SECRET);

         const response = await supertest(app)
            .put('/user/set-new-password')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({
               confirmPassword: 'Password!12345',
               password: 'Password!12345',
            });
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            message: 'Token not provided',
         });
      });

      it('should return 404 if user is not found', async () => {
         const accessToken = jwt.sign(
            { userId: new mongoose.Types.ObjectId() },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .put('/user/set-new-password')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({
               confirmPassword: 'Password!12345',
               password: 'Password!12345',
            });
         expect(response.status).toBe(404);
         expect(response.body).toEqual({
            message: 'User not found',
         });
      });
   });

   describe('Update Username Test', () => {
      it('should update username successfully', async () => {
         const user = await UserModel.findOne({
            email: 'test@example.com',
         });
         const accessToken = jwt.sign(
            { userId: user?._id },
            env.ACCESS_TOKEN_SECRET,
         );
         const response = await supertest(app)
            .put('/user/update-username')
            .send({ username: 'test12356789' })
            .set('Cookie', [`accessToken=${accessToken}`]);
         expect(response.status).toBe(200);
         expect(response.body).toEqual({
            message: 'Username updated successfully',
         });
      });

      it('should return 400 if username is not provided', async () => {
         const user = await UserModel.findOne({
            email: 'test@example.com',
         });
         const accessToken = jwt.sign(
            { userId: user?._id },
            env.ACCESS_TOKEN_SECRET,
         );
         const response = await supertest(app)
            .put('/user/update-username')
            .set('Cookie', [`accessToken=${accessToken}`]);
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            message: 'Username is required',
         });
      });
      it('should return 400 if the token is invalid', async () => {
         const accessToken = jwt.sign({ userId: '' }, env.ACCESS_TOKEN_SECRET);
         const response = await supertest(app)
            .put('/user/update-username')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({ username: 'Test1111111111' });
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            message: 'Invalid token',
         });
      });
      it('should return 404 if user is not found', async () => {
         const accessToken = jwt.sign(
            { userId: new mongoose.Types.ObjectId() },
            env.ACCESS_TOKEN_SECRET,
         );
         const response = await supertest(app)
            .put('/user/update-username')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({ username: 'Test1111111111' });
         expect(response.status).toBe(404);
         expect(response.body).toEqual({
            message: 'User not found',
         });
      });
   });

   describe('Update Profile Image Test', () => {
      it('should upload image successfully', async () => {
         const user = await UserModel.findOne({
            email: 'test@example.com',
         });
         const accessToken = jwt.sign(
            { userId: user?._id },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .put('/user/update-profile-image')
            .set('Cookie', [`accessToken=${accessToken}`])
            .attach('image', testImagePath);
         expect(response.status).toBe(200);
         expect(response.body).toEqual({ message: 'Image uploaded' });
      });

      it('should return 400 when image is not provided', async () => {
         const user = await UserModel.findOne({
            email: 'test@example.com',
         });
         const accessToken = jwt.sign(
            { userId: user?._id },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .put('/user/update-profile-image')
            .set('Cookie', [`accessToken=${accessToken}`]);
         expect(response.status).toBe(400);
         expect(response.body).toEqual({ message: 'Image is required' });
      });

      it('should return 400 when token is invalid', async () => {
         const accessToken = jwt.sign({ userId: '' }, env.ACCESS_TOKEN_SECRET);

         const response = await supertest(app)
            .put('/user/update-profile-image')
            .set('Cookie', [`accessToken=${accessToken}`])
            .attach('image', testImagePath);
         expect(response.status).toBe(400);
         expect(response.body).toEqual({
            message: 'Invalid token',
         });
      });

      it('should return 404 when user is not found', async () => {
         const accessToken = jwt.sign(
            { userId: new mongoose.Types.ObjectId() },
            env.ACCESS_TOKEN_SECRET,
         );

         const response = await supertest(app)
            .put('/user/update-profile-image')
            .set('Cookie', [`accessToken=${accessToken}`])
            .attach('image', testImagePath);
         expect(response.status).toBe(404);
         expect(response.body).toEqual({
            message: 'User not found',
         });
      });
   });
});
