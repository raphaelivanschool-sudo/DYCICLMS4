// Mock student data for student portal
export const mockStudentSession = {
  studentId: 'STU001',
  studentName: 'Student 01',
  studentInitials: 'S1',
  labName: 'EdTech Laboratory',
  roomNumber: 'Room 301',
  seatNumber: 'A1',
  pcName: 'EDT-PC01',
  row: 'Row 1',
  subject: 'Computer Programming',
  section: 'BSIT-3A',
  instructor: 'Mr. Cruz',
  sessionStartTime: '08:08 AM',
  sessionDuration: '3 hours',
  timeElapsed: '02:00:16',
  status: 'active', // 'active' or 'ended'
  loginTime: '08:08 AM',
};

export const mockAnnouncements = [
  { id: 1, title: 'New Learning Material', message: 'Course slides have been uploaded for today\'s lesson.', time: '10:45 AM', type: 'info' },
  { id: 2, title: 'Lab Maintenance', message: 'Scheduled maintenance on Friday at 5:00 PM.', time: 'Yesterday', type: 'warning' },
];

export const mockStudentTickets = [
  { 
    id: 'T-2025-001', 
    subject: 'Keyboard not working properly', 
    category: 'Hardware', 
    priority: 'Medium', 
    status: 'Resolved', 
    created: 'October 8, 2025 - 2:00 PM',
    description: 'Some keys are not responding when pressed.'
  },
  { 
    id: 'T-2025-002', 
    subject: 'Internet connection is slow', 
    category: 'Network', 
    priority: 'Low', 
    status: 'In Progress', 
    created: 'October 9, 2025 - 9:00 AM',
    description: 'Web pages are loading very slowly.'
  },
];

export const mockAttendance = {
  totalSessions: 6,
  present: 4,
  late: 1,
  absent: 1,
  attendanceRate: 83,
  currentStatus: 'Confirmed',
  isConfirmed: true,
};
