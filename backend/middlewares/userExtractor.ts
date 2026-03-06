import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

const userExtractor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.token) {
      res.status(401).json({ error: 'token missing or invalid' });
      return;
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET as string) as any;

    if (!decodedToken.id) {
      res.status(401).json({ error: 'token invalid' });
      return;
    }

    const user = await User.findById(decodedToken.id).select('-passwordHash');;
    req.token = null; 
    if (!user) {
      res.status(401).json({ error: 'user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('User extractor error:', error);
    res.status(401).json({ error: 'token invalid or user extraction failed' });
  }
};

export default userExtractor;
