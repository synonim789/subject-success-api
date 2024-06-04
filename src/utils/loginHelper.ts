import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app';

export const createAndLoginUser = async () => {
   const userData = {
      _id: new mongoose.Types.ObjectId(),
      email: 'userfortesting@gmail.com',
      username: 'userfortesting',
      password: 'Password!12345',
   };

   await supertest(app).post('/user/sign-up').send(userData);

   let response = await supertest(app)
      .post('/auth/login')
      .send({ email: userData.email, password: userData.password });

   const acceessTokenNotSplited = response.header['set-cookie'][1];

   const accessTokenSplitted = acceessTokenNotSplited.split('=');
   const accessTokenValue = accessTokenSplitted[1].split(';')[0];

   response = await supertest(app)
      .get('/user')
      .set('Cookie', `accessToken=${accessTokenValue}`);

   return { accessToken: accessTokenValue, user: response.body };
};
