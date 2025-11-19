import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';


const parseData = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    console.log(req?.body?.data,'check body data')
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data);
    }
    console.log(req?.body,'check parse body data')
  
    next();
  });
};


export default parseData;
