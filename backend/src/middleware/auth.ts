import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Employee, { IEmployee } from '../models/Employee';

interface AuthenticatedRequest extends Request {
  user?: IEmployee;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    const employee = await Employee.findById(decoded.id).select('-password');
    
    if (!employee) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = employee;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};