import React from 'react';
import MonacoEditor from '@monaco-editor/react';

const Editor = ({ code, setCode, runCode, submitSolution }) => {
  return (
    <div className="flex flex-col h-[500px] bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-blue-400">Code Editor</h2>
        <div className="flex space-x-3">
          <button
            onClick={runCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center space-x-2 text-sm font-medium"
          >
            <span>▶️</span>
            <span>Run Code</span>
          </button>
          <button
            onClick={submitSolution}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center space-x-2 text-sm font-medium"
          >
            <span>✓</span>
            <span>Submit Solution</span>
          </button>
        </div>
      </div>
      <div className="flex-1 border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900">
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
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
            contextmenu: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: true,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
        />
      </div>
    </div>
  );
};

export default Editor; 