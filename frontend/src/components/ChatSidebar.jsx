import React, { useState } from 'react';

const ChatSidebar = ({ isOpen, onClose, problem, code }) => {
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAIChat = async (question) => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    // Add user question to chat history
    setChatHistory(prev => [...prev, { question, response: 'Thinking...' }]);
    
    try {
      const response = await fetch('http://localhost:5001/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          type: 'problem',
          problem,
          code,
          user_id: 'user_123'
        }),
      });

      const data = await response.json();
      
      // Update the last response in chat history
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].response = data.response || 'Sorry, I encountered an error.';
        return newHistory;
      });
    } catch (error) {
      console.error('Error in chat:', error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].response = 'Sorry, I encountered an error. Please try again.';
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-blue-400">AI Tutor</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="flex flex-col h-[calc(100%-4rem)] p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p className="text-lg mb-2">👋 Welcome to CodeEdgeAI Tutor!</p>
                <p className="text-sm">Ask me anything about the current problem or your code.</p>
                {problem && (
                  <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-300">Current Problem:</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-3">{problem}</p>
                  </div>
                )}
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div key={index} className="space-y-2">
                  <div className="bg-blue-900/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-200">{chat.question}</p>
                  </div>
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">{chat.response}</pre>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && userQuestion.trim() && !isLoading) {
                  handleAIChat(userQuestion);
                  setUserQuestion('');
                }
              }}
              placeholder="Ask about the problem or your code..."
              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => {
                if (userQuestion.trim() && !isLoading) {
                  handleAIChat(userQuestion);
                  setUserQuestion('');
                }
              }}
              disabled={isLoading}
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center space-x-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>💬</span>
              <span>{isLoading ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 