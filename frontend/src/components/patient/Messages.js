import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Search, User, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { messagesAPI } from '../../services/api';

/**
 * SECURE PATIENT-DOCTOR MESSAGING SYSTEM
 * HIPAA-compliant messaging with encryption and audit trails
 */
const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data);
      if (response.data.length > 0) {
        selectConversation(response.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const response = await messagesAPI.getConversationMessages(conversation.otherUser.id);
      setMessages(response.data);
      // Mark messages as read
      const unreadMessages = response.data.filter(msg => !msg.read && msg.senderId !== conversation.currentUserId);
      for (const msg of unreadMessages) {
        await messagesAPI.markAsRead(msg.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await messagesAPI.sendMessage({
        receiverId: selectedConversation.otherUser.id,
        subject: selectedConversation.subject || 'Message',
        content: newMessage,
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col" style={{ backgroundColor: 'white', borderColor: 'var(--gray-200)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
          <h2 className="heading-h2 mb-3">Messages</h2>
          <div className="relative">
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--gray-400)' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <AlertCircle style={{ width: '48px', height: '48px', color: 'var(--error-600)', margin: '0 auto 8px' }} />
              <p className="text-sm text-secondary">{error}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <User style={{ width: '48px', height: '48px', color: 'var(--gray-400)', margin: '0 auto 8px' }} />
              <p className="text-sm text-secondary">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className="p-4 border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'var(--gray-200)',
                  backgroundColor: selectedConversation?.id === conv.id ? 'var(--primary-50)' : 'transparent',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)' }}>
                    <User style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="badge badge-primary badge-sm">{conv.unreadCount}</span>
                      )}
                    </div>
                    <p className="text-xs text-secondary mb-1">{conv.otherUser.specialization || 'Doctor'}</p>
                    <p className="text-sm text-secondary truncate">{conv.lastMessage?.content || 'No messages yet'}</p>
                    <p className="text-xs text-secondary mt-1">
                      {conv.lastMessage ? format(new Date(conv.lastMessage.sentAt), 'MMM d, h:mm a') : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'white' }}>
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-center gap-3">
              <div className="avatar" style={{ background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)' }}>
                <User style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                </h3>
                <p className="text-sm text-secondary">{selectedConversation.otherUser.specialization || 'Doctor'}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Send style={{ width: '48px', height: '48px', color: 'var(--gray-400)', margin: '0 auto 8px' }} />
                  <p className="text-sm text-secondary">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.senderId === selectedConversation.currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-md p-3 rounded-lg"
                      style={{
                        backgroundColor: isCurrentUser ? '#1570EF' : 'var(--gray-100)',
                        color: isCurrentUser ? 'white' : 'var(--gray-900)',
                      }}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p className="text-xs" style={{ opacity: 0.7 }}>
                          {format(new Date(msg.sentAt), 'h:mm a')}
                        </p>
                        {isCurrentUser && (
                          msg.status === 'read' ? <CheckCheck style={{ width: '14px', height: '14px' }} /> : <Clock style={{ width: '14px', height: '14px' }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="alert alert-warning mb-3">
              <AlertCircle style={{ width: '18px', height: '18px' }} />
              <p className="text-sm">This is a secure, encrypted messaging system. Do not share sensitive financial information.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="form-input flex-1"
              />
              <button className="btn btn-secondary">
                <Paperclip style={{ width: '20px', height: '20px' }} />
              </button>
              <button onClick={handleSendMessage} className="btn btn-primary">
                <Send style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'white' }}>
          <div className="text-center">
            <div className="avatar avatar-xl mb-4" style={{ background: 'linear-gradient(135deg, #1570EF 0%, #175CD3 100%)', margin: '0 auto' }}>
              <Send style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h3 className="heading-h3 mb-2">Select a Conversation</h3>
            <p className="text-secondary">Choose a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
