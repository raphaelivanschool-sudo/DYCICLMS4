// Mock student data for instructor portal
export const mockStudents = [
  { id: 'STU001', name: 'Student 01', seat: 'A1', status: 'online', pcName: 'EDT-PC01', lastActive: '2 mins ago' },
  { id: 'STU002', name: 'Student 02', seat: 'A2', status: 'online', pcName: 'EDT-PC02', lastActive: '1 min ago' },
  { id: 'STU003', name: 'Student 03', seat: 'A3', status: 'idle', pcName: 'EDT-PC03', lastActive: '5 mins ago' },
  { id: 'STU004', name: 'Student 04', seat: 'A4', status: 'online', pcName: 'EDT-PC04', lastActive: 'Just now' },
  { id: 'STU005', name: 'Student 05', seat: 'A5', status: 'offline', pcName: 'EDT-PC05', lastActive: '30 mins ago' },
  { id: 'STU006', name: 'Student 06', seat: 'B1', status: 'online', pcName: 'EDT-PC06', lastActive: '3 mins ago' },
  { id: 'STU007', name: 'Student 07', seat: 'B2', status: 'online', pcName: 'EDT-PC07', lastActive: 'Just now' },
  { id: 'STU008', name: 'Student 08', seat: 'B3', status: 'idle', pcName: 'EDT-PC08', lastActive: '8 mins ago' },
  { id: 'STU009', name: 'Student 09', seat: 'B4', status: 'online', pcName: 'EDT-PC09', lastActive: '1 min ago' },
  { id: 'STU010', name: 'Student 10', seat: 'B5', status: 'online', pcName: 'EDT-PC10', lastActive: '2 mins ago' },
  { id: 'STU011', name: 'Student 11', seat: 'C1', status: 'offline', pcName: 'EDT-PC11', lastActive: '45 mins ago' },
  { id: 'STU012', name: 'Student 12', seat: 'C2', status: 'online', pcName: 'EDT-PC12', lastActive: 'Just now' },
  { id: 'STU013', name: 'Student 13', seat: 'C3', status: 'online', pcName: 'EDT-PC13', lastActive: '4 mins ago' },
  { id: 'STU014', name: 'Student 14', seat: 'C4', status: 'idle', pcName: 'EDT-PC14', lastActive: '12 mins ago' },
  { id: 'STU015', name: 'Student 15', seat: 'C5', status: 'online', pcName: 'EDT-PC15', lastActive: '1 min ago' },
  { id: 'STU016', name: 'Student 16', seat: 'D1', status: 'online', pcName: 'EDT-PC16', lastActive: '2 mins ago' },
  { id: 'STU017', name: 'Student 17', seat: 'D2', status: 'offline', pcName: 'EDT-PC17', lastActive: '1 hour ago' },
  { id: 'STU018', name: 'Student 18', seat: 'D3', status: 'online', pcName: 'EDT-PC18', lastActive: 'Just now' },
  { id: 'STU019', name: 'Student 19', seat: 'D4', status: 'online', pcName: 'EDT-PC19', lastActive: '3 mins ago' },
  { id: 'STU020', name: 'Student 20', seat: 'D5', status: 'idle', pcName: 'EDT-PC20', lastActive: '6 mins ago' },
];

export const mockClassSession = {
  labName: 'EdTech Laboratory',
  roomNumber: 'Room 301',
  subject: 'Computer Programming',
  section: 'BSIT-3A',
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  time: '1:00 PM - 4:00 PM',
};

export const mockMessages = [
  { id: 1, studentId: 'STU001', studentName: 'Student 01', content: 'Thank you, sir!', timestamp: '2m ago', sentBy: 'student' },
  { id: 2, studentId: 'STU002', studentName: 'Student 02', content: 'I understand now', timestamp: '5m ago', sentBy: 'student' },
  { id: 3, studentId: 'STU003', studentName: 'Student 03', content: 'Can you help me with...', timestamp: '15m ago', sentBy: 'student', unread: true },
  { id: 4, studentId: 'STU004', studentName: 'Student 04', content: 'Okay sir', timestamp: '1h ago', sentBy: 'student' },
  { id: 5, studentId: 'STU005', studentName: 'Student 05', content: 'See you next session', timestamp: '2d ago', sentBy: 'student' },
];
