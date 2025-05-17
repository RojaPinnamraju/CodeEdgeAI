import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, setCode }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleResize = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (editorRef.current) {
        try {
          editorRef.current.layout();
        } catch (error) {
          console.error('Error during layout:', error);
        }
      }
    });
  };

  useEffect(() => {
    resizeObserverRef.current = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current);
    }

    handleResize();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="python"
        value={code}
        onChange={setCode}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: false,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          }
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditor; 