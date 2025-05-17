import React from 'react';

const OutputBox = ({ output }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-blue-400">Output</h2>
      <div className="bg-gray-900 p-4 rounded-lg h-32 overflow-y-auto">
        <pre className="text-gray-200 text-sm font-mono whitespace-pre-wrap">
          {output || 'No output yet. Run your code to see the results.'}
        </pre>
      </div>
    </div>
  );
};

export default OutputBox; 