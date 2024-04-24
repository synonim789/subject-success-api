import { Types } from 'mongoose';

declare global {
   namespace Express {
      export interface Request {
         user?: {
            userId: Types.ObjectId;
            iat: number;
            exp: number;
         };
      }
   }
}
