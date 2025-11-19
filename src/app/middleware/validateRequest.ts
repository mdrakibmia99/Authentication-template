import { NextFunction, Request, Response } from 'express';
// import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';
// import { AnyZodObject } from 'zod/v3';

const validateRequest = (schema: any) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   const validateData = await schema.parseAsync({
      body: req.body,
      files: req.files,
      file: req.file,
      cookies: req.cookies,
    });
    req.body=validateData.body
    next();
  });
};

export default validateRequest;
