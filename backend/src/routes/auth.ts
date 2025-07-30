import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Employee from '../models/Employee';

const router = express.Router();

// Register employee
router.post('/register', async (req, res) => {
  try {
    const { employeeId, name, email, password, department, position } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ 
      $or: [{ email }, { employeeId }] 
    });

    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const employee = new Employee({
      employeeId,
      name,
      email,
      password: hashedPassword,
      department,
      position
    });

    await employee.save();

    res.status(201).json({ 
      message: 'Employee registered successfully',
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login employee
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find employee
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: employee._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;