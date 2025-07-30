import express from 'express';
import Attendance from '../models/Attendance';
import { authenticateToken } from '../middleware/auth';
import { IEmployee } from '../models/Employee';

interface AuthenticatedRequest extends express.Request {
  user?: IEmployee;
}

const router = express.Router();

// Check in
router.post('/checkin', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = new Attendance({
      employeeId,
      date: today,
      checkIn: new Date(),
      status: 'present'
    });

    await attendance.save();
    await attendance.populate('employeeId', 'name employeeId');

    res.status(201).json({
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Check out
router.post('/checkout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    const totalHours = (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    attendance.checkOut = checkOutTime;
    attendance.totalHours = Math.round(totalHours * 100) / 100;

    await attendance.save();
    await attendance.populate('employeeId', 'name employeeId');

    res.json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get attendance records for an employee
router.get('/:employeeId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let query: any = { employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name employeeId')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get today's attendance status
router.get('/status/today', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    res.json({
      hasCheckedIn: !!attendance,
      hasCheckedOut: attendance?.checkOut ? true : false,
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;