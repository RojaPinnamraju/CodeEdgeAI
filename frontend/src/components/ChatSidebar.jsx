import React from 'react';

const ChatSidebar = ({ aiResponse, userQuestion, setUserQuestion, handleAIChat, chatHistory }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg mb-2">👋 Welcome to CodeEdgeAI Chat!</p>
              <p className="text-sm">Ask me anything about coding, algorithms, or your current problem.</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <p className="text-sm text-gray-200">{chat.question}</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-sm text-gray-200">{chat.response}</p>
                </div>
              </div>
            ))
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
              if (e.key === 'Enter' && userQuestion.trim()) {
                handleAIChat(userQuestion);
                setUserQuestion('');
              }
            }}
            placeholder="Ask me anything about coding..."
            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => {
              if (userQuestion.trim()) {
                handleAIChat(userQuestion);
                setUserQuestion('');
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
          >
            <span>💬</span>
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 