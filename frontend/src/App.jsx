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
    const response = await fetch('http://localhost:5001/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        type,
        problem,
        code,
        user_id: 'user_123' // Add a user_id to track conversation history
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

const getVideoRecommendations = async (concept, difficulty) => {
  try {
    const response = await fetch(`http://localhost:5001/api/video-recommendations?concept=${concept}&difficulty=${difficulty}`);
    const data = await response.json();
    if (data.success) {
      return data.recommendations;
    } else {
      throw new Error(data.error || 'Failed to get video recommendations');
    }
  } catch (error) {
    console.error('Error getting video recommendations:', error);
    return [];
  }
};

// Navigation component
const Navigation = ({ isChatOpen, setIsChatOpen, generateNewQuestion }) => {
  const location = useLocation();
  const isCodeWithAIPage = location.pathname === '/code-with-ai';

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold text-blue-400">CodeEdgeAI</h1>
      <div className="flex space-x-2">
        {isCodeWithAIPage ? (
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
          >
            Back to Main
          </Link>
        ) : (
          <Link
            to="/code-with-ai"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
          >
            Code with AI
          </Link>
        )}
        {!isCodeWithAIPage && (
          <>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              {isChatOpen ? 'Close Chat' : 'Open Chat'}
            </button>
            <button
              onClick={generateNewQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
            >
              Generate Question
            </button>
          </>
        )}
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      setLoading(true);
      setError(null);
      
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
      setError(error.message);
    } finally {
      setLoading(false);
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
      const runResponse = await fetch('http://localhost:5001/run', {
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

      // If code runs successfully, update progress
      setSolvedProblems(prev => prev + 1);
      setSolvedProblemIds(prev => [...prev, problem]);
      
      // Add success message to chat
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: "Great job! Your solution has been submitted successfully. You can generate a new problem or continue practicing!",
        isSuccessReaction: true
      }]);

      // Clear the output and code
      setOutput('');
      setCode('');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleAIChat = async (message) => {
    try {
      setLoading(true);
      setError(null);
      
      setChatHistory(prev => [...prev, { type: 'user', content: message }]);
      
      const aiResponse = await askAI(message, 'general', problem, code);
      
      setChatHistory(prev => [...prev, { type: 'ai', content: aiResponse }]);
      setAiResponse(aiResponse);
    } catch (error) {
      setError(error.message);
      setChatHistory(prev => [...prev, { type: 'error', content: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/code-with-ai" element={<CodeWithAI />} />
        <Route path="/" element={
          <div className="flex h-screen bg-gray-900 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <Navigation 
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                generateNewQuestion={generateNewQuestion}
              />
              
              {/* Category and Concept Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      const firstConcept = Object.keys(categories[e.target.value].concepts)[0];
                      setConcept(firstConcept);
                    }}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key} className="bg-gray-800">{value.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Concept</label>
                  <select
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(categories[category].concepts).map(([key, value]) => (
                      <option key={key} value={key} className="bg-gray-800">{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Difficulty Level Filters */}
              <div className="flex space-x-2 mb-4">
                {Object.entries(difficulties).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 shadow-md ${
                      difficulty === key 
                        ? key === 'easy' 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : key === 'medium' 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-2">
                <ProgressBar solvedProblems={solvedProblems} />
              </div>
              
              {/* Problem Card */}
              <div className="mb-2 max-h-[20vh] overflow-y-auto">
                <ProblemCard problem={problem} />
              </div>
              
              {/* Editor and Output */}
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
                  <Editor code={code} setCode={setCode} />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={runCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                  >
                    Run Code
                  </button>
                  <button
                    onClick={submitSolution}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                  >
                    Submit Solution
                  </button>
                </div>
                <div className="h-32">
                  <OutputBox output={output} />
                </div>
              </div>
            </div>
            
            {/* AI Chat Sidebar */}
            {isChatOpen && (
              <div className="w-96 bg-gray-800 shadow-lg flex flex-col overflow-hidden">
                <div className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-400">AI Tutor</h2>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto mb-4">
                    {loading && (
                      <div className="flex justify-center items-center mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-900/50 p-4 rounded-lg mb-4">
                        <p className="text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Chat History */}
                    <div className="space-y-4">
                      {chatHistory.map((message, index) => (
                        <div key={index} className={`p-4 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-900/50 ml-8 text-gray-200' 
                            : message.type === 'error'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-gray-700/50 mr-8 text-gray-200'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAIChat(userQuestion);
                            setUserQuestion('');
                          }
                        }}
                        placeholder="Ask the AI tutor..."
                        className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          handleAIChat(userQuestion);
                          setUserQuestion('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App; 