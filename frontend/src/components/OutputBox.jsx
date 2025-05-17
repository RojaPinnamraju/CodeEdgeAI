import React from 'react';

const OutputBox = ({ output }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-blue-400 mb-2">Output</h2>
      <div className="flex-1 bg-gray-900 rounded p-2 overflow-y-auto">
        <pre className="text-gray-200 text-xs font-mono whitespace-pre-wrap">
          {output || 'No output yet. Run your code to see the results.'}
        </pre>
      </div>
    </div>
  );
};

export default OutputBox; 