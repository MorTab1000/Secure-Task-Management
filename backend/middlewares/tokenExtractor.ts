import { Request, Response, NextFunction } from 'express';

const tokenExtractor = (request: Request, response: Response, next: NextFunction) => {
  const authorization = request.get('authorization');
  
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '');
  } else {
    request.token = null;
  }

  next();
};

export default tokenExtractor;
