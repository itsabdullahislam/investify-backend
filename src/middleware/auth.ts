import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../utils/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'booblessguy';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
  return
}

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (typeof decoded === 'object' && decoded !== null) {
        req.user = decoded as UserPayload;
    } else {
         res.status(401).json({ message: "Invalid token" });
    }
    next();
  } catch (err) {
     res.status(401).json({ message: "Invalid token" });
  }
};  
