import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'booblessguy';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export interface UserPayload {
  id: number;
  role: string;
}