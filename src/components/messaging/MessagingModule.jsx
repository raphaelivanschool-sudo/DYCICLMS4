import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Search, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck,
  Circle,
  User
} from 'lucide-react';
import messagingService from '../../services/messagingService';

const MessagingModule = ({ isOpen, onClose, userRole, currentUser }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations when module opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, userRole]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await messagingService.getConversations(userRole);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chat) => {
    setLoading(true);
    try {
      const data = await messagingService.getMessages('current', chat.userId);
      setMessages(data);
      
      // Mark messages as read
      await messagingService.markAsRead('current', chat.userId);
      
      // Update unread count in conversations
      setConversations(prev => prev.map(conv => 
        conv.id === chat.id ? { ...conv, unread: 0 } : conv
      ));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedChat) {
      try {
        const newMessage = await messagingService.sendMessage('current', selectedChat.userId, messageInput.trim());
        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
        
        // Update conversation's last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedChat.id 
            ? { ...conv, lastMessage: messageInput.trim(), time: 'Just now' }
            : conv
        ));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await messagingService.searchConversations(query, userRole);
        setConversations(results);
      } catch (error) {
        console.error('Error searching conversations:', error);
      }
    } else {
      loadConversations();
    }
  };

  const filteredConversations = conversations;

  const getRoleColor = (role) => {
    switch (role) {
      case 'Instructor': return 'bg-green-100 text-green-700';
      case 'Administrator': return 'bg-blue-100 text-blue-700';
      case 'Support': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIndicator = (conversation) => {
    if (conversation.typing) return 'text-yellow-500';
    if (conversation.online) return 'text-green-500';
    return 'text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {conversation.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusIndicator(conversation)}`}></div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{conversation.name}</p>
                        <span className="text-xs text-gray-500 flex-shrink-0">{conversation.time}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(conversation.role)}`}>
                          {conversation.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.typing ? 'typing...' : conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {selectedChat.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusIndicator(selectedChat)}`}></div>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{selectedChat.name}</p>
                      <p className="text-xs text-gray-500">
                        {selectedChat.online ? 'Active now' : 'Offline'} • {selectedChat.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${message.isMe ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.isMe
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div className={`flex items-center mt-1 text-xs text-gray-500 ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{message.time}</span>
                          {message.isMe && (
                            <span className="ml-2">
                              {message.read ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3 text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                      />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingModule;
