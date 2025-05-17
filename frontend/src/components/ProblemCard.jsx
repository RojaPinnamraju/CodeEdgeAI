import React from 'react';

const ProblemCard = ({ problem }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-blue-400 mb-2">Problem Statement</h3>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">{problem}</p>
      </div>
    </div>
  );
};

export default ProblemCard; 