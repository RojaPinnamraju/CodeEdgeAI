import React from 'react';

function OutputBox({ output }) {
  return (
    <div className="h-full bg-gray-800 text-gray-200 p-3 rounded-lg overflow-auto font-mono">
      <h3 className="text-sm font-semibold text-blue-400 mb-1">Output</h3>
      <pre className="text-sm whitespace-pre-wrap">{output || 'No output yet'}</pre>
    </div>
  );
}

export default OutputBox; 