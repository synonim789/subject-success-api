import bcrypt from 'bcrypt'
import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import UserModel from '../models/User.model'
import env from '../utils/cleanEnv'
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

    const user = await UserModel.create({
      username: username,
      email: email,
      password: password,
    })

    res.status(201).json({ message: `User ${user.username} created` })
  } catch (error) {
    next(error)
  }
}

interface LoginBody {
  email?: string
  password?: string
}

export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const email = req.body.email
  const passwordRaw = req.body.password
  try {
    if (!email || !passwordRaw) {
      throw createHttpError(
        400,
        'Please provide both email and password to proceed'
      )
    }

    const user = await UserModel.findOne({ email }).exec()
    if (!user || !user.password) {
      throw createHttpError(401, 'Invalid email or password')
    }

    const passwordMatch = await bcrypt.compare(passwordRaw, user.password)

    if (!passwordMatch) {
      throw createHttpError(401, 'Invalid email or password')
    }

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    )
    const refreshToken = jwt.sign(
      { userId: user._id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    )

    res
      .status(201)
      .cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'none',
      })
      .json({ accessToken })
  } catch (error) {
    next(error)
  }
}

export const refresh: RequestHandler = async (req, res, next) => {
  const cookies = req.cookies
  try {
    if (!cookies.jwt) {
      throw createHttpError(401, 'Unauthorized')
    }

    const refreshToken = cookies.jwt

    jwt.verify(
      refreshToken,
      env.REFRESH_TOKEN_SECRET,
      async (err: unknown, decoded: any) => {
        try {
          if (err) throw createHttpError(403, 'Forbidden')
          const foundUser = await UserModel.findById(decoded.userId).exec()
          if (!foundUser) {
            throw createHttpError(401, 'Unauthorized')
          }
          const accessToken = jwt.sign(
            { userId: foundUser._id, username: foundUser.username },
            env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
          )
          res.status(201).json({ accessToken })
        } catch (error) {
          next(error)
        }
      }
    )
  } catch (error) {
    next(error)
  }
}

export const getUser: RequestHandler = async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
}
