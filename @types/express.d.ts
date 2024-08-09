import { Request } from "express";

declare global {
   namespace Express {
      export interface Request {
         user: {
            _id: string;
            username: string;
            password: string | null | undefined;
            googleId?: string | null;
            githubId?: string | null;
            picture?: string | null;
         };
      }
   }
}
