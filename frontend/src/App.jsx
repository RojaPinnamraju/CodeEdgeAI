import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Editor from './components/Editor';
import ChatSidebar from './components/ChatSidebar';
import OutputBox from './components/OutputBox';
import ProblemCard from './components/ProblemCard';
import ProgressBar from './components/ProgressBar';
import CodeWithAI from './pages/CodeWithAI';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Export the askAI function
export const askAI = async (question, type = 'general', problem = '', code = '') => {
  try {
    const response = await fetch(`${API_URL}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        type,
        problem,
        code,
        user_id: 'user_123'
      }),
    });

    const data = await response.json();
    if (data.success) {
      return data.response;
    } else {
      throw new Error(data.error || 'Failed to get AI response');
    }
  } catch (error) {
    console.error('Error asking AI:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};

// Navigation component
const Navigation = ({ isChatOpen, setIsChatOpen, generateNewQuestion }) => {
  const location = useLocation();
  const isCodeWithAIPage = location.pathname === '/code-with-ai';

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-blue-400">CodeEdgeAI</h1>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">Your AI Coding Companion</span>
        </div>
        <div className="flex space-x-4">
          {isCodeWithAIPage ? (
            <Link
              to="/"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Main</span>
            </Link>
          ) : (
            <Link
              to="/code-with-ai"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
            >
              <span>🤖</span>
              <span>Code with AI</span>
            </Link>
          )}
          {!isCodeWithAIPage && (
            <>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
              >
                <span>{isChatOpen ? '✕' : '💬'}</span>
                <span>{isChatOpen ? 'Close Chat' : 'Open Chat'}</span>
              </button>
              <button
                onClick={generateNewQuestion}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
              >
                <span>🎯</span>
                <span>Generate Question</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [problem, setProblem] = useState('Click "Generate Question" to get a new coding challenge!');
  const [userQuestion, setUserQuestion] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [category, setCategory] = useState('data_structures');
  const [concept, setConcept] = useState('arrays');
  const [difficulty, setDifficulty] = useState('medium');
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const saved = localStorage.getItem('solvedProblems');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [solvedProblemIds, setSolvedProblemIds] = useState(() => {
    const saved = localStorage.getItem('solvedProblemIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatHistory, setChatHistory] = useState([]);

  const categories = {
    data_structures: {
      name: 'Data Structures',
      concepts: {
        arrays: 'Arrays',
        linked_lists: 'Linked Lists',
        stacks: 'Stacks',
        queues: 'Queues',
        hash_tables: 'Hash Tables',
        graphs: 'Graphs',
        trees: 'Trees',
        heaps: 'Heaps',
        tries: 'Tries',
        segment_trees: 'Segment Trees',
        fenwick_trees: 'Fenwick Trees',
        disjoint_set: 'Disjoint Set Union'
      }
    },
    algorithms: {
      name: 'Algorithms',
      concepts: {
        sorting: 'Sorting Algorithms',
        searching: 'Searching Algorithms',
        divide_conquer: 'Divide and Conquer',
        greedy: 'Greedy Algorithms',
        dynamic_programming: 'Dynamic Programming',
        graph_algorithms: 'Graph Algorithms',
        string_algorithms: 'String Algorithms',
        number_theory: 'Number Theory'
      }
    }
  };

  const difficulties = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };

  // Load saved progress on component mount
  useEffect(() => {
    const savedProblems = localStorage.getItem('solvedProblems');
    const savedProblemIds = localStorage.getItem('solvedProblemIds');
    
    if (savedProblems) {
      setSolvedProblems(parseInt(savedProblems, 10));
    }
    if (savedProblemIds) {
      setSolvedProblemIds(JSON.parse(savedProblemIds));
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    localStorage.setItem('solvedProblems', solvedProblems.toString());
    localStorage.setItem('solvedProblemIds', JSON.stringify(solvedProblemIds));
  }, [solvedProblems, solvedProblemIds]);

  const generateNewQuestion = async () => {
    try {
      const response = await fetch(`${API_URL}/generate-question?category=${category}&concept=${concept}&difficulty=${difficulty}`);
      const data = await response.json();
      
      if (data.success) {
        setProblem(data.question);
        setCode('');
        setOutput('');
        setAiResponse('');
        setChatHistory([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const runCode = async () => {
    try {
      if (!code.trim()) {
        setOutput('Error: Please write some code before running');
        return;
      }

      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      if (data.success) {
        setOutput(data.output);
      } else {
        setOutput(`Error: ${data.error}\n${data.traceback || ''}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const submitSolution = async () => {
    try {
      if (!code.trim()) {
        setOutput('Error: Please write some code before submitting');
        return;
      }

      // First run the code to check if it works
      const runResponse = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const runData = await runResponse.json();
      if (!runData.success) {
        setOutput(`Error: ${runData.error}\n${runData.traceback || ''}`);
        return;
      }

      // If code runs successfully, submit it
      const submitResponse = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          problem,
          category,
          concept,
          difficulty
        }),
      });

      const submitData = await submitResponse.json();
      if (submitData.success) {
        setOutput('Solution submitted successfully!');
        if (!solvedProblemIds.includes(submitData.problem_id)) {
          setSolvedProblems(prev => prev + 1);
          setSolvedProblemIds(prev => [...prev, submitData.problem_id]);
        }
      } else {
        setOutput(`Error: ${submitData.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleAIChat = async (message) => {
    try {
      const response = await askAI(message, 'general', problem, code);
      setAiResponse(response);
      setChatHistory(prev => [...prev, { question: message, response }]);
    } catch (error) {
      setAiResponse(`Error: ${error.message}`);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/code-with-ai" element={<CodeWithAI />} />
            <Route
              path="/"
              element={
                <>
                  <Navigation 
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                    generateNewQuestion={generateNewQuestion}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <ProblemCard
                          problem={problem}
                          category={category}
                          concept={concept}
                          difficulty={difficulty}
                          setCategory={setCategory}
                          setConcept={setConcept}
                          setDifficulty={setDifficulty}
                          categories={categories}
                          difficulties={difficulties}
                        />
                      </div>
                      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <Editor
                          code={code}
                          setCode={setCode}
                          runCode={runCode}
                          submitSolution={submitSolution}
                        />
                      </div>
                      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <OutputBox output={output} />
                      </div>
                    </div>
                    {isChatOpen && (
                      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <ChatSidebar
                          aiResponse={aiResponse}
                          userQuestion={userQuestion}
                          setUserQuestion={setUserQuestion}
                          handleAIChat={handleAIChat}
                          chatHistory={chatHistory}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <ProgressBar solvedProblems={solvedProblems} />
                  </div>
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 