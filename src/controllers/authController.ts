import axios from 'axios';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import qs from 'querystring';
import UserModel from '../models/User.model';
import env from '../utils/cleanEnv';
import getGithubUser from '../utils/getGithubUser';
import getGoogleUser from '../utils/getGoogleUser';

interface LoginBody {
   email?: string;
   password?: string;
}

export const login: RequestHandler<
   unknown,
   unknown,
   LoginBody,
   unknown
> = async (req, res, next) => {
   const email = req.body.email;
   const passwordRaw = req.body.password;
   try {
      if (!email || !passwordRaw) {
         throw createHttpError(
            400,
            'Please provide both email and password to proceed',
         );
      }

      const user = await UserModel.findOne({ email }).exec();
      if (!user || !user.password) {
         throw createHttpError(401, 'Invalid email or password');
      }

      const passwordMatch = await bcrypt.compare(passwordRaw, user.password);

      if (!passwordMatch) {
         throw createHttpError(401, 'Invalid email or password');
      }

      const accessToken = jwt.sign(
         { userId: user._id, username: user.username },
         env.ACCESS_TOKEN_SECRET,
         { expiresIn: '15m' },
      );
      const refreshToken = jwt.sign(
         { userId: user._id },
         env.REFRESH_TOKEN_SECRET,
         { expiresIn: '1d' },
      );

      res.status(201)
         .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 15,
         })
         .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24,
         })
         .json(accessToken);
   } catch (error) {
      next(error);
   }
};

export const refresh: RequestHandler = async (req, res, next) => {
   const cookies = req.cookies;
   try {
      if (!cookies.refreshToken) {
         throw createHttpError(401, 'Unauthorized');
      }

      const refreshToken = cookies.refreshToken;

      jwt.verify(
         refreshToken,
         env.REFRESH_TOKEN_SECRET,
         async (err: unknown, decoded: any) => {
            try {
               if (err) throw createHttpError(403, 'Forbidden');
               const foundUser = await UserModel.findById(
                  decoded.userId,
               ).exec();
               if (!foundUser) {
                  throw createHttpError(401, 'Unauthorized');
               }
               const accessToken = jwt.sign(
                  { userId: foundUser._id, username: foundUser.username },
                  env.ACCESS_TOKEN_SECRET,
                  { expiresIn: '1h' },
               );
               res.status(201).json(accessToken);
            } catch (error) {
               next(error);
            }
         },
      );
   } catch (error) {
      next(error);
   }
};

interface GoogleAuthQuery {
   code: string;
}

interface GoogleTokensResult {
   access_token: string;
   expires_in: number;
   refresh_token: string;
   scope: string;
   id_token: string;
}

export const googleAuth: RequestHandler<
   unknown,
   unknown,
   unknown,
   GoogleAuthQuery
> = async (req, res, next) => {
   const code = req.query.code;
   try {
      const url = 'https://oauth2.googleapis.com/token';

      const values = {
         code,
         client_id: env.GOOGLE_CLIENT_ID,
         client_secret: env.GOOGLE_CLIENT_SECRET,
         redirect_uri: env.GOOGLE_REDIRECT_URL,
         grant_type: 'authorization_code',
      };

      const axiosResponse = await axios.post<GoogleTokensResult>(
         url,
         qs.stringify(values),
         {
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
            },
         },
      );
      if (!axiosResponse) {
         throw createHttpError(500, 'Failed to fetch Google Auth Tokens');
      }

      const { id_token, access_token } = axiosResponse.data;

      const googleUser = await getGoogleUser({ id_token, access_token });

      const user = await UserModel.findOneAndUpdate(
         {
            email: googleUser.email,
         },
         {
            username: googleUser.name,
            googleId: googleUser.id,
         },
         {
            new: true,
            upsert: true,
         },
      );

      const accessToken = jwt.sign(
         { userId: user._id, username: user.username },
         env.ACCESS_TOKEN_SECRET,
         { expiresIn: '1h' },
      );
      const refreshToken = jwt.sign(
         { userId: user._id },
         env.REFRESH_TOKEN_SECRET,
         { expiresIn: '1d' },
      );
      res.status(201)
         .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 15,
         })
         .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24,
         })
         .redirect('http://localhost:5173');
   } catch (error: any) {
      next(error);
   }
};

interface GitHubAuthQuery {
   code: string;
   path: string;
}

export const githubAuth: RequestHandler<
   unknown,
   unknown,
   unknown,
   GitHubAuthQuery
> = async (req, res, next) => {
   const code = req.query.code;
   const path = req.query.path;
   try {
      const githubUser = await getGithubUser({ code });

      const user = await UserModel.findOneAndUpdate(
         {
            githubId: githubUser.id,
         },
         {
            username: githubUser.login,
            githubId: githubUser.id,
         },
         {
            new: true,
            upsert: true,
         },
      );

      const accessToken = jwt.sign(
         { userId: user._id, username: user.username },
         env.ACCESS_TOKEN_SECRET,
         { expiresIn: '1h' },
      );
      const refreshToken = jwt.sign(
         { userId: user._id },
         env.REFRESH_TOKEN_SECRET,
         { expiresIn: '1d' },
      );

      res.status(201)
         .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 15,
         })
         .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24,
         })
         .redirect(`http://localhost:5173${path}`);
   } catch (error) {
      next(error);
   }
};

export const logout: RequestHandler = async (req, res, next) => {
   try {
   } catch (error) {
      next(error);
   }
};
