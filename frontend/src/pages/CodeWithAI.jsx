import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import OutputBox from '../components/OutputBox';
import { askAI } from '../App';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const CodeWithAI = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [solvedProblems, setSolvedProblems] = useState(0);
  const [lastCodeChange, setLastCodeChange] = useState(Date.now());
  const [isUserStuck, setIsUserStuck] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentQuestionTitle, setCurrentQuestionTitle] = useState(null);
  const [progress, setProgress] = useState({
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0
  });
  const inactivityTimer = useRef(null);
  const codeAnalysisTimer = useRef(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();

  const difficulties = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };

  const problemCategories = [
    'arrays_and_hashing',
    'two_pointers',
    'sliding_window',
    'stack',
    'binary_search',
    'linked_list',
    'trees',
    'tries',
    'heap_priority_queue',
    'backtracking',
    'graphs',
    'advanced_graphs',
    '1d_dynamic_programming',
    '2d_dynamic_programming',
    'greedy',
    'intervals',
    'math_and_geometry',
    'bit_manipulation'
  ];

  const generateProblem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/generate-question?user_id=user_123&use_advanced=true`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentProblem(data.question);
        setCurrentDifficulty(data.difficulty);
        setCurrentCategory(data.concept);
        if (data.is_advanced) {
          const titleMatch = data.question.match(/Title: (.*?)\n/);
          if (titleMatch) {
            setCurrentQuestionTitle(titleMatch[1]);
          }
        }
        setCode('');
        setOutput('');
        setAiResponse('');
        setChatHistory([]);
        
        const interviewPrompt = `Hi! Welcome To Code With AI. Let's get started with a ${data.difficulty} problem!`;
        setChatHistory(prev => [...prev, { type: 'ai', content: interviewPrompt, isWelcome: true }]);
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

      // If code runs successfully, update progress
      const progressResponse = await fetch(`${API_URL}/update-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: 'user_123',
          difficulty: currentDifficulty
        }),
      });
      
      const progressData = await progressResponse.json();
      if (progressData.success) {
        setProgress(progressData.progress);
        setCurrentDifficulty(progressData.current_difficulty);
        setSolvedProblems(prev => prev + 1);
        
        // Add success message to chat
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          content: "Great job! Your solution has been submitted successfully. Let's move on to the next problem!",
          isSuccessReaction: true
        }]);
        
        // Generate next problem after a short delay
        setTimeout(() => {
          generateProblem();
        }, 2000);
      } else {
        setOutput('Error updating progress. Please try again.');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    const timer = setTimeout(() => {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/');
      }, 2000);
    }, 300000); // 5 minutes
    inactivityTimer.current = timer;
  }, [navigate, setShowSuccessMessage]);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [resetInactivityTimer]);

  useEffect(() => {
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [resetInactivityTimer]);

  const handleAIChat = async (message) => {
    try {
      setLoading(true);
      setError(null);
      resetInactivityTimer();
      
      setChatHistory(prev => [...prev, { type: 'user', content: message }]);
      
      // Check if the message is asking for code
      const isCodeRequest = message.toLowerCase().includes('code') || 
                          message.toLowerCase().includes('solution') ||
                          message.toLowerCase().includes('implement') ||
                          message.toLowerCase().includes('write');
      
      // Get AI response with interview context
      const aiResponse = await askAI(
        `As an interviewer, respond to the candidate's message: "${message}" regarding the problem: ${currentProblem}. 
        The candidate's current code is: ${code}. 
        ${isCodeRequest ? 'If providing code, wrap it in triple backticks with python language specification (```python).' : ''}
        Provide feedback, ask probing questions, or guide them through the solution process.`,
        'interview',
        currentProblem,
        code
      );
      
      // Check if the response contains code
      const codeMatch = aiResponse.match(/```python\n([\s\S]*?)```/);
      if (codeMatch) {
        const extractedCode = codeMatch[1].trim();
        setSuggestedCode(extractedCode);
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          content: aiResponse,
          hasCode: true,
          code: extractedCode
        }]);
      } else {
        setChatHistory(prev => [...prev, { type: 'ai', content: aiResponse }]);
      }
      
      setAiResponse(aiResponse);
    } catch (error) {
      setError(error.message);
      setChatHistory(prev => [...prev, { type: 'error', content: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCode = (code) => {
    setCode(code);
    setSuggestedCode(null);
  };

  // Function to analyze user's code and provide feedback
  const analyzeCode = useCallback(async () => {
    if (!code.trim()) return;

    try {
      const response = await askAI(
        `As an interviewer, analyze this code for the problem: ${currentProblem}\n\nCode:\n${code}`,
        'code_analysis',
        currentProblem,
        code
      );

      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: response,
        isCodeAnalysis: true
      }]);
    } catch (error) {
      console.error('Error analyzing code:', error);
    }
  }, [code, currentProblem]);

  // Function to check if user is stuck
  const checkUserProgress = useCallback(() => {
    const timeSinceLastChange = Date.now() - lastCodeChange;
    if (timeSinceLastChange > 5 * 60 * 1000 && !isUserStuck) { // 5 minutes
      setIsUserStuck(true);
      handleAIChat("I notice you've been working on this problem for a while. Would you like some guidance or have any specific questions about the approach?");
    }
  }, [lastCodeChange, isUserStuck, handleAIChat]);

  // Function to react to successful code execution
  const reactToSuccess = useCallback(async () => {
    if (output.includes('Success')) {
      const response = await askAI(
        `The candidate successfully solved the problem: ${currentProblem}\n\nTheir solution:\n${code}`,
        'success_reaction',
        currentProblem,
        code
      );

      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: response,
        isSuccessReaction: true
      }]);
    }
  }, [output, currentProblem, code]);

  // Effect for code change tracking
  useEffect(() => {
    setLastCodeChange(Date.now());
    setIsUserStuck(false);

    // Clear existing timers
    if (inactivityTimer.current) {
      clearInterval(inactivityTimer.current);
    }
    if (codeAnalysisTimer.current) {
      clearInterval(codeAnalysisTimer.current);
    }

    // Set up new timers
    inactivityTimer.current = setInterval(checkUserProgress, 60 * 1000); // Check every minute
    codeAnalysisTimer.current = setInterval(analyzeCode, 2 * 60 * 1000); // Analyze code every 2 minutes

    return () => {
      if (inactivityTimer.current) {
        clearInterval(inactivityTimer.current);
      }
      if (codeAnalysisTimer.current) {
        clearInterval(codeAnalysisTimer.current);
      }
    };
  }, [code, checkUserProgress, analyzeCode]);

  // Effect for success reaction
  useEffect(() => {
    if (output) {
      reactToSuccess();
    }
  }, [output, reactToSuccess]);

  useEffect(() => {
    generateProblem();
  }, [currentDifficulty]);

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-blue-400">Code with AI</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
            >
              Back to Main
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Solved:</span>
              <span className="text-green-400 font-bold">{solvedProblems}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Current Level:</span>
              <span className={`font-bold ${
                currentDifficulty === 'easy' ? 'text-green-400' :
                currentDifficulty === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {difficulties[currentDifficulty]}
              </span>
            </div>
            <button
              onClick={generateProblem}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
            >
              New Problem
            </button>
          </div>
        </div>

        {/* Progress Display */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Easy Solved</div>
            <div className="text-xl font-bold text-green-400">{progress.easy_solved}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Medium Solved</div>
            <div className="text-xl font-bold text-yellow-400">{progress.medium_solved}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Hard Solved</div>
            <div className="text-xl font-bold text-red-400">{progress.hard_solved}</div>
          </div>
        </div>

        {/* Problem Display */}
        <div className="mb-2 p-3 bg-gray-800 rounded-lg max-h-[15vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-blue-400 mb-1">Current Problem</h2>
          <div className="text-gray-200 text-sm whitespace-pre-wrap">
            {currentProblem || 'Loading problem...'}
          </div>
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

      {/* AI Interviewer Sidebar */}
      <div className="w-96 bg-gray-800 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-700">
          <h2 className="text-lg font-bold text-blue-400">AI Interviewer</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading && (
            <div className="flex justify-center items-center mb-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 p-3 rounded-lg mb-2">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Chat History */}
          <div className="space-y-2">
            {chatHistory.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-900/50 ml-8 text-gray-200' 
                  : message.type === 'error'
                    ? 'bg-red-900/50 text-red-400'
                    : message.isWelcome
                      ? 'bg-indigo-900/50 mr-8 text-gray-200'
                      : message.isCodeAnalysis
                        ? 'bg-purple-900/50 mr-8 text-gray-200'
                        : message.isSuccessReaction
                          ? 'bg-green-900/50 mr-8 text-gray-200'
                          : 'bg-gray-700/50 mr-8 text-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.hasCode && (
                  <div className="mt-2 space-y-2">
                    <pre className="bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto">
                      <code>{message.code}</code>
                    </pre>
                    <button
                      onClick={() => handleApproveCode(message.code)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200"
                    >
                      Approve & Insert Code
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-gray-700">
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
              placeholder="Ask the AI interviewer..."
              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Session completed! Redirecting to main page...
        </div>
      )}
    </div>
  );
};

export default CodeWithAI; 