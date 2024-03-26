import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../src/app'

const userInput = {
  email: 'text@example.com',
  username: 'John Doe',
  password: 'Test12345!',
}

const userPayload = {
  email: 'text@example.com',
  username: 'John Doe',
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

describe('Sign Up Test', () => {
  it('should return with a 201 status code with user payload', async () => {
    const { statusCode, body } = await supertest(app)
      .post('/user/sign-up')
      .send(userInput)
    expect(statusCode).toBe(201)
    expect(body).toEqual(userPayload)
  })
  it("Should return with a 400 status and 'all fields must be filled' message", async () => {
    const { body, statusCode } = await supertest(app)
      .post('/user/sign-up')
      .send({ ...userInput, password: '' })
    expect(statusCode).toBe(400)
    expect(body.message).toEqual('All fields must be filled')
  })
  it("Should return with a 400 status and 'Not valid Email' message", async () => {
    const { body, statusCode } = await supertest(app)
      .post('/user/sign-up')
      .send({ ...userInput, email: 'test.gmail.com' })
    expect(statusCode).toBe(400)
    expect(body.message).toEqual('Not valid Email')
  })
  it("Should return with a 400 status and 'Password not strong enough.' message", async () => {
    const { body, statusCode } = await supertest(app)
      .post('/user/sign-up')
      .send({ ...userInput, password: 'test' })
    expect(statusCode).toBe(400)
    expect(body.message).toEqual('Password not strong enough.')
  })
  it("Should return with a 409 status and 'Username already taken' message", async () => {
    const { body, statusCode } = await supertest(app)
      .post('/user/sign-up')
      .send({ ...userInput, email: 'test2@gmail.com' })
    expect(statusCode).toBe(409)
    expect(body.message).toEqual('Username already taken')
  })
  it("Should return with a 409 status and 'Email already taken' message", async () => {
    const { body, statusCode } = await supertest(app)
      .post('/user/sign-up')
      .send({ ...userInput, username: 'test2' })
    expect(statusCode).toBe(409)
    expect(body.message).toEqual('Email already taken')
  })
})
