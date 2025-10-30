import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../../services/api';
import { Send, Paperclip, X, FileText, CheckCircle, AlertCircle, Stethoscope, User } from 'lucide-react';

/**
 * WORLD-CLASS MEDICAL CHATBOT COMPONENT
 * Modern messaging UI inspired by WhatsApp, Telegram, and professional medical portals
 */
const Chatbot = ({ conversationId, onConversationEnd }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [doctorResponse, setDoctorResponse] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isDoctorResponseExpanded, setIsDoctorResponseExpanded] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      // Welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI Medical Assistant. I\'m here to help gather detailed information about your health concerns before your consultation with a physician.\n\nYour responses will help the doctor understand your situation better and provide you with the best possible care. Please take your time and be as detailed as you can.\n\nTo begin, could you please tell me what brings you in today? What symptoms or concerns would you like to discuss?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [conversationId]);

  const loadConversation = async (id) => {
    try {
      const response = await chatbotAPI.getConversation(id);
      setMessages(response.data.conversation.messages);
      setCurrentConversationId(id);
      if (response.data.conversation.doctorResponse) {
        setDoctorResponse(response.data.conversation.doctorResponse);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !attachedFile) || loading) return;

    const userMessageContent = inputMessage.trim() || '';
    const fileToUpload = attachedFile;

    let fullMessageContent = userMessageContent;
    if (fileToUpload && userMessageContent) {
      fullMessageContent = `${userMessageContent}\n\n[Attached: ${fileToUpload.name}]`;
    } else if (fileToUpload && !userMessageContent) {
      fullMessageContent = `[Attached: ${fileToUpload.name}]`;
    }

    const userMessage = {
      role: 'user',
      content: fullMessageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setAttachedFile(null);
    setLoading(true);

    try {
      if (fileToUpload) {
        setUploadingFile(true);

        let convId = currentConversationId;
        if (!convId) {
          const initialResponse = await chatbotAPI.sendMessage(
            userMessageContent || 'I have a medical document to share.',
            null
          );
          convId = initialResponse.data.conversationId;
          setCurrentConversationId(convId);

          const aiMessage = {
            role: 'assistant',
            content: initialResponse.data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        }

        await uploadFileToServer(fileToUpload, convId);
        setUploadingFile(false);

        const systemMessage = {
          role: 'system',
          content: `File "${fileToUpload.name}" uploaded successfully.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMessage]);

        const fileNotificationMessage = `I have uploaded a file: ${fileToUpload.name}`;
        const fileResponse = await chatbotAPI.sendMessage(fileNotificationMessage, convId);

        const aiFileResponse = {
          role: 'assistant',
          content: fileResponse.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiFileResponse]);

        if (fileResponse.data.status === 'awaiting_doctor') {
          onConversationEnd && onConversationEnd(fileResponse.data.conversationId);
        }
      } else {
        const response = await chatbotAPI.sendMessage(
          userMessageContent,
          currentConversationId
        );

        const aiMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setCurrentConversationId(response.data.conversationId);

        if (response.data.status === 'awaiting_doctor') {
          onConversationEnd && onConversationEnd(response.data.conversationId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'system',
        content: 'Sorry, there was an error sending your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToServer = async (file, convId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', convId);

    await chatbotAPI.uploadFile(formData);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setAttachedFile(file);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col" style={{ height: '100%', backgroundColor: '#FCFCFD' }}>
      {/* Doctor Response Banner (if exists) */}
      {doctorResponse && (
        <div
          className="border-b"
          style={{
            backgroundColor: '#ECFDF3',
            borderColor: '#D1FADF',
          }}
        >
          <div className="p-4">
            <button
              onClick={() => setIsDoctorResponseExpanded(!isDoctorResponseExpanded)}
              className="w-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="avatar avatar-sm"
                  style={{
                    background: 'linear-gradient(135deg, #039855 0%, #027A48 100%)',
                  }}
                >
                  <Stethoscope style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm" style={{ color: '#054F31' }}>
                    Doctor's Response
                  </p>
                  <p className="text-xs" style={{ color: '#027A48' }}>
                    Dr. {doctorResponse.doctor?.firstName} {doctorResponse.doctor?.lastName}
                  </p>
                </div>
                <span className="text-xs" style={{ color: '#027A48' }}>
                  {isDoctorResponseExpanded ? 'Hide' : 'Show'}
                </span>
              </div>
            </button>

            {isDoctorResponseExpanded && (
              <div className="mt-3 animate-fadeIn">
                {doctorResponse.diagnosis && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#054F31' }}>
                      DIAGNOSIS
                    </p>
                    <p className="text-sm" style={{ color: '#027A48' }}>
                      {doctorResponse.diagnosis}
                    </p>
                  </div>
                )}
                {doctorResponse.recommendations && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#054F31' }}>
                      RECOMMENDATIONS
                    </p>
                    <p className="text-sm" style={{ color: '#027A48' }}>
                      {doctorResponse.recommendations}
                    </p>
                  </div>
                )}
                {doctorResponse.prescriptions && doctorResponse.prescriptions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#027A48' }}>
                      PRESCRIPTIONS
                    </p>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: '#EBF5FF',
                        border: '2px solid #B3DDFF',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <FileText style={{ width: '20px', height: '20px', color: '#1570EF', flexShrink: 0 }} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1" style={{ color: '#194185' }}>
                            {doctorResponse.prescriptions.length} Prescription{doctorResponse.prescriptions.length > 1 ? 's' : ''} Issued
                          </p>
                          <p className="text-xs mb-3" style={{ color: '#175CD3' }}>
                            Your prescriptions are ready to download as professional PDF documents.
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // This will be handled by the parent component to switch tabs
                              window.dispatchEvent(new CustomEvent('switchToPrescriptions'));
                            }}
                            className="btn btn-primary btn-sm"
                            style={{
                              minHeight: '36px',
                              fontSize: '13px',
                            }}
                          >
                            <FileText style={{ width: '16px', height: '16px' }} />
                            View & Download Prescriptions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ backgroundColor: '#FCFCFD' }}>
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
              } mb-4`}
            >
              {/* Avatar */}
              <div
                className={`chat-avatar ${
                  message.role === 'user' ? 'chat-avatar-user' : 'chat-avatar-bot'
                }`}
              >
                {message.role === 'user' ? (
                  <User style={{ width: '20px', height: '20px' }} />
                ) : message.role === 'system' ? (
                  <AlertCircle style={{ width: '20px', height: '20px' }} />
                ) : (
                  <Stethoscope style={{ width: '20px', height: '20px' }} />
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex-1">
                <div
                  className={`chat-bubble ${
                    message.role === 'user'
                      ? 'chat-bubble-user'
                      : message.role === 'system'
                      ? 'chat-bubble-system'
                      : 'chat-bubble-bot'
                  }`}
                  style={
                    message.role === 'system'
                      ? {
                          backgroundColor: '#FFFAEB',
                          color: '#B54708',
                          border: '1px solid #FEF0C7',
                        }
                      : {}
                  }
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                </div>
                <p className="chat-timestamp px-4 mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="chat-message chat-message-bot mb-4">
              <div className="chat-avatar chat-avatar-bot">
                <Stethoscope style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="flex-1">
                <div className="chat-bubble chat-bubble-bot">
                  <div className="flex items-center gap-2">
                    <span className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div
        className="border-t p-4"
        style={{
          backgroundColor: 'white',
          borderColor: '#EAECF0',
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* File Attachment Preview */}
          {attachedFile && (
            <div className="mb-3 animate-fadeIn">
              <div
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: '#EBF5FF',
                  border: '1px solid #B3DDFF',
                }}
              >
                <FileText style={{ width: '20px', height: '20px', color: '#1570EF' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#194185' }}>
                    {attachedFile.name}
                  </p>
                  <p className="text-xs" style={{ color: '#175CD3' }}>
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={removeAttachedFile}
                  className="btn btn-ghost btn-icon btn-sm"
                  style={{ color: '#D92D20' }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploadingFile}
              className="btn btn-secondary btn-icon"
              title="Attach file"
            >
              <Paperclip style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message... (Shift + Enter for new line)"
                className="form-input resize-none"
                style={{
                  minHeight: '52px',
                  maxHeight: '120px',
                  paddingTop: 'var(--space-3)',
                  paddingBottom: 'var(--space-3)',
                }}
                rows="1"
                disabled={loading || uploadingFile}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputMessage.trim() && !attachedFile) || loading || uploadingFile}
              className="btn btn-primary btn-icon btn-lg"
            >
              {uploadingFile ? (
                <span className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
              ) : (
                <Send style={{ width: '20px', height: '20px' }} />
              )}
            </button>
          </form>

          {/* Helper Text */}
          <p className="text-xs mt-2 text-center" style={{ color: '#667085' }}>
            Share your symptoms, medical history, or upload documents (images, PDFs, max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
