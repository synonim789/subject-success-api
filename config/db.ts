import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Collection } from 'mongoose'

const mongoDb = new MongoMemoryServer()

export const connect = async () => {
  const uri = mongoDb.getUri()
  await mongoose.connect(uri)
}

export const disconnect = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoDb.stop()
}

export const clearDb = async () => {
  const collections = mongoose.connection.collection
  for (const key in collections) {
    const collection: Collection = collections[key]
    await collection.deleteMany()
  }
}
