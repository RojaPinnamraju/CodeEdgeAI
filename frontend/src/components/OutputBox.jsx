import React from 'react';

const OutputBox = ({ output }) => {
  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-bold text-blue-400 mb-4">Output</h2>
      <div className="flex-1 border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900 p-4">
        <pre className="text-gray-200 text-sm font-mono whitespace-pre-wrap h-full">
          {output || 'No output yet. Run your code to see the results.'}
        </pre>
      </div>
    </div>
  );
};

export default OutputBox; 