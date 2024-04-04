import jwt from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../app'
import UserModel from '../models/User.model'
import env from '../utils/cleanEnv'

const singUpInput = {
  _id: 'jgurtergier',
  email: 'text@example.com',
  username: 'John Doe',
  password: 'Test12345!',
}

const logInInput = {
  email: 'text@example.com',
  password: 'Test12345!',
}

beforeAll(async () => {
  const mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  mongoose.connect(uri)
})
afterAll(async () => {
  await mongoose.disconnect()
  await mongoose.connection.close()
})

describe('User Routes test', () => {
  describe('Sign Up Test', () => {
    it('should return with a 201 status code with User "${user.username} created" message', async () => {
      const { statusCode, body } = await supertest(app)
        .post('/user/sign-up')
        .send(singUpInput)
      expect(statusCode).toBe(201)
      expect(body.message).toEqual(
        `${singUpInput.username} created! Welcome now you have to log in`
      )
    })

    it("Should return with a 400 status and 'all fields must be filled' message", async () => {
      const { body, statusCode } = await supertest(app)
        .post('/user/sign-up')
        .send({ ...singUpInput, password: '' })
      expect(statusCode).toBe(400)
      expect(body.message).toEqual('All fields must be filled')
    })

    it("Should return with a 400 status and 'Not valid Email' message", async () => {
      const { body, statusCode } = await supertest(app)
        .post('/user/sign-up')
        .send({ ...singUpInput, email: 'test.gmail.com' })
      expect(statusCode).toBe(400)
      expect(body.message).toEqual('Not valid Email')
    })

    it("Should return with a 400 status and 'Password not strong enough.' message", async () => {
      const { body, statusCode } = await supertest(app)
        .post('/user/sign-up')
        .send({ ...singUpInput, password: 'test' })
      expect(statusCode).toBe(400)
      expect(body.message).toEqual('Password not strong enough.')
    })

    it("Should return with a 409 status and 'Username already taken' message", async () => {
      const { body, statusCode } = await supertest(app)
        .post('/user/sign-up')
        .send({ ...singUpInput, email: 'test2@gmail.com' })
      expect(statusCode).toBe(409)
      expect(body.message).toEqual('Username already taken')
    })

    it("Should return with a 409 status and 'Email already taken' message", async () => {
      const { body, statusCode } = await supertest(app)
        .post('/user/sign-up')
        .send({ ...singUpInput, username: 'test2' })
      expect(statusCode).toBe(409)
      expect(body.message).toEqual('Email already taken')
    })
  })
  describe('Login test', () => {
    it('should return with a 201 status code with user payload and set cookies', async () => {
      const { statusCode, body, headers } = await supertest(app)
        .post('/auth/login')
        .send(logInInput)
      expect(statusCode).toBe(201)
      expect(body).toBeTruthy()
      expect(headers['set-cookie']).toBeDefined()
    })
    it("Should return with a 400 status and 'Please provide both email and password to proceed' message", async () => {
      const { statusCode, body } = await supertest(app)
        .post('/auth/login')
        .send({})
      expect(statusCode).toBe(400)
      expect(body.message).toEqual(
        'Please provide both email and password to proceed'
      )
    })
    it("Should return with a 401 status and 'Invalid email or password' message", async () => {
      const { statusCode, body } = await supertest(app)
        .post('/auth/login')
        .send({ ...logInInput, email: 'test2@gmail.com' })
      expect(statusCode).toBe(401)
      expect(body.message).toEqual('Invalid email or password')
    })
    it("Should return with a 401 status and 'Invalid email or password' message", async () => {
      const { statusCode, body } = await supertest(app)
        .post('/auth/login')
        .send({ ...logInInput, password: 'test' })
      expect(statusCode).toBe(401)
      expect(body.message).toEqual('Invalid email or password')
    })
  })
  describe('Refresh Token Test', () => {
    it('Should return a new access token when the refresh token is valid', async () => {
      const user = await UserModel.findOne({ email: logInInput.email }).exec()
      const mockedRefreshToken = jwt.sign(
        { userId: user?._id },
        env.REFRESH_TOKEN_SECRET
      )
      const { statusCode, body } = await supertest(app)
        .get('/auth/refresh')
        .set('Cookie', `refreshToken=${mockedRefreshToken}`)
      expect(statusCode).toBe(201)
      expect(body).toBeDefined()
    })

    it('Should return a 401 status and "Unauthorized" message when there is no cookie', async () => {
      const { statusCode, body } = await supertest(app).get('/auth/refresh')
      expect(statusCode).toBe(401)
      expect(body.message).toEqual('Unauthorized')
    })

    it('Should return a 403 if the refresh token is invalid', async () => {
      const { statusCode, body } = await supertest(app)
        .get('/auth/refresh')
        .set('Cookie', 'refreshToken=invalid')
      expect(statusCode).toBe(403)
      expect(body.message).toEqual('Forbidden')
    })

    it('Should return a 401 if the user is not found', async () => {
      const userId = new mongoose.Types.ObjectId().toString()
      const mockedRefreshToken = jwt.sign(
        { userId: userId },
        env.REFRESH_TOKEN_SECRET
      )
      const { statusCode, body } = await supertest(app)
        .get('/auth/refresh')
        .set('Cookie', `refreshToken=${mockedRefreshToken}`)
      expect(statusCode).toBe(401)
      expect(body.message).toEqual('Unauthorized')
    })
  })
})
