import express from 'express';
import Employee, { IEmployee } from '../models/Employee';
import { authenticateToken } from '../middleware/auth';

interface AuthenticatedRequest extends express.Request {
  user?: IEmployee;
}

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, department, position } = req.body;
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, department, position },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;