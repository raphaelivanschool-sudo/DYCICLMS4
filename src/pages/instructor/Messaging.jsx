import { useState } from 'react';
import { Send, Search, MessageCircle, Megaphone, X, ChevronLeft } from 'lucide-react';
import { mockStudents, mockClassSession, mockMessages } from '../../data/mockInstructorData';

function Messaging() {
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.seat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: Date.now(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        content: messageInput,
        timestamp: 'Just now',
        sentBy: 'instructor'
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      const newBroadcast = {
        id: Date.now(),
        studentId: 'ALL',
        studentName: 'All Students',
        content: broadcastMessage,
        timestamp: 'Just now',
        sentBy: 'instructor',
        isBroadcast: true
      };
      setMessages([newBroadcast, ...messages]);
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    }
  };

  const getStudentMessages = (studentId) => {
    return messages.filter(m => m.studentId === studentId || (m.isBroadcast && studentId));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messaging</h1>
            <p className="text-gray-500">Communicate with students in {mockClassSession.labName}</p>
          </div>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast Message
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Student List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.map((student) => {
              const studentMessages = getStudentMessages(student.id);
              const lastMessage = studentMessages[studentMessages.length - 1];
              const unreadCount = studentMessages.filter(m => m.unread && m.sentBy === 'student').length;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                  }`}
                >
                  {/* Avatar with Status */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.status === 'offline' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                      <span className={`text-sm font-semibold ${student.status === 'offline' ? 'text-gray-400' : 'text-blue-600'}`}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusDotColor(student.status)}`}></span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${student.status === 'offline' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {student.name}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full min-w-[18px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Seat {student.seat}</p>
                    {lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{lastMessage.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedStudent.status === 'offline' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                  <span className={`text-sm font-semibold ${selectedStudent.status === 'offline' ? 'text-gray-400' : 'text-blue-600'}`}>
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusDotColor(selectedStudent.status)}`}></span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                <p className="text-xs text-gray-500">{selectedStudent.seat} • {getStatusDotColor(selectedStudent.status).includes('green') ? 'Online' : getStatusDotColor(selectedStudent.status).includes('yellow') ? 'Idle' : 'Offline'}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {getStudentMessages(selectedStudent.id).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation with {selectedStudent.name}</p>
              </div>
            ) : (
              getStudentMessages(selectedStudent.id).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sentBy === 'instructor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      message.sentBy === 'instructor'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.sentBy === 'instructor' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Message ${selectedStudent.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Broadcast Message</h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">This message will be sent to all students in {mockClassSession.labName}</p>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your broadcast message..."
                className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={!broadcastMessage.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  <Megaphone className="w-4 h-4" />
                  Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messaging;
