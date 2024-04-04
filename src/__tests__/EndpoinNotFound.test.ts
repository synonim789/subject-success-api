import supertest from 'supertest';
import app from '../app';

describe('Endpoint Not Found Test', () => {
   it('should return status 404 and Endpoint not found message', async () => {
      const { statusCode, body } = await supertest(app).get('/not-found');
      expect(statusCode).toBe(404);
      expect(body.message).toBe('Endpoint not found');
   });
});
