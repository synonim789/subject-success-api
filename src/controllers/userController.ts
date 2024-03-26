import bcrypt from 'bcrypt'
import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import UserModel from '../models/User.model'

interface SignUpBody {
  username?: string
  email?: string
  password?: string
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username
  const email = req.body.email
  const passwordRaw = req.body.password
  try {
    if (!username || !email || !passwordRaw) {
      throw createHttpError(400, 'All fields must be filled')
    }

    const emailRegex = new RegExp(
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
    )

    if (!emailRegex.test(email)) {
      throw createHttpError(400, 'Not valid Email')
    }

    const passwordRegex = new RegExp(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    )

    if (!passwordRegex.test(passwordRaw)) {
      throw createHttpError(400, 'Password not strong enough.')
    }

    const existingUsername = await UserModel.findOne({
      username: username,
    }).exec()

    if (existingUsername) {
      throw createHttpError(409, 'Username already taken')
    }

    const existingEmail = await UserModel.findOne({ email: email }).exec()

    if (existingEmail) {
      throw createHttpError(409, 'Email already taken')
    }

    const password = await bcrypt.hash(passwordRaw, 10)

    const newUser = await UserModel.create({
      username: username,
      email: email,
      password: password,
    })

    res.status(201).json({ email: newUser.email, username: newUser.username })
  } catch (error) {
    next(error)
  }
}
