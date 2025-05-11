import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../utils/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'booblessguy';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    (req as any).user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
