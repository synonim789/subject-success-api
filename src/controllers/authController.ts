import axios from 'axios';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import qs from 'querystring';
import UserModel from '../models/User.model';
import {
   GithubAuthSchema,
   GoogleAuthSchema,
   LoginSchema,
} from '../schemas/auth';
import env from '../utils/cleanEnv';
import getGithubUser from '../utils/getGithubUser';
import getGoogleUser from '../utils/getGoogleUser';

export const login: RequestHandler = async (req, res) => {
   const validatedData = LoginSchema.parse(req.body);

   const user = await UserModel.findOne({ email: validatedData.email }).exec();
   if (!user) {
      throw createHttpError(401, 'Invalid email or password');
   }

   if (user.googleId || user.googleId) {
      throw createHttpError(401, 'User is signed up by Google or Github');
   }

   const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.password,
   );

   if (!passwordMatch) {
      throw createHttpError(401, 'Invalid email or password');
   }

   const accessToken = jwt.sign({ userId: user._id }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
   });
   const refreshToken = jwt.sign(
      { userId: user._id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' },
   );

   res.status(201)
      .cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: 1000 * 60 * 60 * 24,
      })
      .cookie('accessToken', accessToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: 1000 * 60 * 15,
      })
      .json({ isAuthenticated: true });
};

export const refresh: RequestHandler = async (req, res, next) => {
   const cookies = req.cookies;
   const refreshToken = cookies.refreshToken;

   jwt.verify(
      refreshToken,
      env.REFRESH_TOKEN_SECRET,
      async (err: unknown, decoded: any) => {
         try {
            if (err) throw createHttpError(403, 'Forbidden');
            const foundUser = await UserModel.findById(decoded.userId).exec();
            if (!foundUser) {
               throw createHttpError(401, 'Unauthorized');
            }
            const accessToken = jwt.sign(
               { userId: foundUser._id },
               env.ACCESS_TOKEN_SECRET,
               { expiresIn: '1h' },
            );
            res.cookie('accessToken', accessToken, {
               httpOnly: true,
               secure: true,
               sameSite: 'none',
               maxAge: 1000 * 60 * 15,
            });
            res.status(201).json({ isAuthenticated: true });
         } catch (error) {
            next(error);
         }
      },
   );
};

interface GoogleTokensResult {
   access_token: string;
   expires_in: number;
   refresh_token: string;
   scope: string;
   id_token: string;
}

export const googleAuth: RequestHandler = async (req, res, next) => {
   const { code } = GoogleAuthSchema.parse(req.query);
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

   let user = await UserModel.findOne({
      $or: [{ email: googleUser.email }, { googleId: googleUser.id }],
   }).exec();

   if (!user) {
      user = await UserModel.create({
         username: googleUser.name,
         email: googleUser.email,
         picture: googleUser.picture,
         googleId: googleUser.id,
      });
   }

   const refreshToken = jwt.sign(
      { userId: user._id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' },
   );

   const accessToken = jwt.sign({ userId: user._id }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
   });

   res.status(201)
      .cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: 1000 * 60 * 60 * 24,
      })
      .cookie('accessToken', accessToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: 1000 * 60 * 15,
      })
      .redirect('http://localhost:5173');
};

export const githubAuth: RequestHandler = async (req, res, next) => {
   const validatedData = GithubAuthSchema.parse(req.query);

   const githubUser = await getGithubUser({ code: validatedData.code });

   let user = await UserModel.findOne({
      $or: [
         { email: githubUser.githubEmail.email },
         { githubId: githubUser.githubData.id },
      ],
   }).exec();

   if (!user) {
      user = await UserModel.create({
         username: githubUser.githubData.login,
         email: githubUser.githubEmail.email,
         picture: githubUser.githubData.avatar_url,
         githubId: githubUser.githubData.id,
      });
   }

   const refreshToken = jwt.sign(
      { userId: user._id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' },
   );

   res.status(201)
      .cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: 1000 * 60 * 60 * 24,
      })
      .redirect(`http://localhost:5173${validatedData.path}`);
};

export const logout: RequestHandler = async (req, res, next) => {
   const cookies = req.cookies;
   if (!cookies.refreshToken) {
      return res.sendStatus(204);
   }
   res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
   });
   res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
   });

   res.status(200).json({ message: 'User logged out' });
};
