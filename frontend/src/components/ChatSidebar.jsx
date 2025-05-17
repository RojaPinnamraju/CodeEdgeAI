import React, { useState, useRef, useEffect } from 'react';
import { askAI } from '../App';

const ChatSidebar = ({ isOpen, onClose, currentProblem, currentCode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [questionType, setQuestionType] = useState('general');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (text) => {
    // Split the text by code blocks
    const parts = text.split(/```(?:python)?\n?|\n?```/);
    
    return parts.map((part, index) => {
      // If it's a code block (odd index), format it as code
      if (index % 2 === 1) {
        return (
          <pre key={index} className="bg-gray-900 p-4 rounded-lg overflow-x-auto font-mono text-sm">
            {part}
          </pre>
        );
      }
      // Otherwise, return as regular text
      return <span key={index}>{part}</span>;
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Get AI response with conversation context, current problem, and current code
      const response = await askAI(input, questionType, currentProblem, currentCode);
      
      // Add AI response to chat
      const aiMessage = { text: response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 text-white p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">AI Tutor</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setQuestionType('debug')}
          className={`px-3 py-1 rounded ${
            questionType === 'debug' ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          Debug Help
        </button>
        <button
          onClick={() => setQuestionType('explain')}
          className={`px-3 py-1 rounded ${
            questionType === 'explain' ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          Step-by-Step
        </button>
        <button
          onClick={() => setQuestionType('concept')}
          className={`px-3 py-1 rounded ${
            questionType === 'concept' ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          Study Concepts
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-600 ml-auto'
                : 'bg-gray-700'
            } max-w-[80%] ${
              message.sender === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            {formatMessage(message.text)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Ask a ${questionType} question...`}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar; 