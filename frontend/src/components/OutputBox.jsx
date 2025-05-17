import React from 'react';

const OutputBox = ({ output }) => {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-bold text-blue-400">Output</h2>
      <div className="bg-gray-900 p-2 rounded h-24 overflow-y-auto">
        <pre className="text-gray-200 text-xs font-mono whitespace-pre-wrap">
          {output || 'No output yet. Run your code to see the results.'}
        </pre>
      </div>
    </div>
  );
};

export default OutputBox; 