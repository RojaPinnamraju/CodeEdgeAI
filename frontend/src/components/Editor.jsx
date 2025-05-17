import React from 'react';
import MonacoEditor from '@monaco-editor/react';

const Editor = ({ code, setCode, runCode, submitSolution }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-blue-400">Code Editor</h2>
        <div className="flex space-x-2">
          <button
            onClick={runCode}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center space-x-1 text-sm"
          >
            <span>▶️</span>
            <span>Run</span>
          </button>
          <button
            onClick={submitSolution}
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center space-x-1 text-sm"
          >
            <span>✓</span>
            <span>Submit</span>
          </button>
        </div>
      </div>
      <div className="h-[300px] border border-gray-700 rounded overflow-hidden">
        <MonacoEditor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
};

export default Editor; 