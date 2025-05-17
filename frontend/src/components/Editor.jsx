import React from 'react';
import MonacoEditor from '@monaco-editor/react';

const Editor = ({ code, setCode, runCode, submitSolution }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-400">Code Editor</h2>
        <div className="flex space-x-2">
          <button
            onClick={runCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
          >
            <span>▶️</span>
            <span>Run Code</span>
          </button>
          <button
            onClick={submitSolution}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
          >
            <span>✓</span>
            <span>Submit Solution</span>
          </button>
        </div>
      </div>
      <div className="h-[400px] border border-gray-700 rounded-lg overflow-hidden">
        <MonacoEditor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
};

export default Editor; 