import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Editor from './components/Editor';
import ChatSidebar from './components/ChatSidebar';
import OutputBox from './components/OutputBox';
import ProblemCard from './components/ProblemCard';
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
const Navigation = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
          CodeEdgeAI
        </Link>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/code-with-ai')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>🤖</span>
            <span>Code with AI</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const MainPage = () => {
  const [showChat, setShowChat] = useState(false);
  const [problem, setProblem] = useState('Click "Generate Question" to get a new coding challenge!');
  const [code, setCode] = useState('# Write your code here\n');
  const [output, setOutput] = useState('');
  const [category, setCategory] = useState('data_structures');
  const [concept, setConcept] = useState('arrays');
  const [difficulty, setDifficulty] = useState('medium');
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = {
    data_structures: {
      name: 'Data Structures',
      concepts: {
        arrays: 'Arrays',
        linked_lists: 'Linked Lists',
        trees: 'Trees',
        graphs: 'Graphs',
        stacks: 'Stacks',
        queues: 'Queues',
        hash_tables: 'Hash Tables',
        heaps: 'Heaps'
      }
    },
    algorithms: {
      name: 'Algorithms',
      concepts: {
        sorting: 'Sorting',
        searching: 'Searching',
        dynamic_programming: 'Dynamic Programming',
        greedy: 'Greedy',
        backtracking: 'Backtracking',
        divide_and_conquer: 'Divide and Conquer',
        graph_algorithms: 'Graph Algorithms',
        string_algorithms: 'String Algorithms'
      }
    }
  };

  const difficulties = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };

  const generateNewQuestion = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Generating question with:', { category, concept, difficulty });
      
      const response = await fetch(`${API_URL}/generate-question?category=${category}&concept=${concept}&difficulty=${difficulty}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      if (data.question) {
        setProblem(data.question);
        setCode('# Write your code here\n');
        setOutput('');
      } else {
        throw new Error('No problem generated in response');
      }
    } catch (error) {
      console.error('Error generating question:', error);
      setError(error.message || 'Failed to generate question. Please try again.');
      setProblem('Error: Could not generate a new question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const runCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Running code:', code);
      
      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Run code response:', data);
      
      if (data.success) {
        setOutput(data.output || 'No output generated.');
      } else {
        throw new Error(data.error || 'Failed to run code');
      }
    } catch (error) {
      console.error('Error running code:', error);
      setError(error.message || 'Failed to run code. Please make sure the backend server is running at ' + API_URL);
      setOutput('Error: Could not run the code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitSolution = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/submit-solution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          category,
          concept,
          difficulty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOutput(data.message || 'Solution submitted successfully!');
      if (data.correct) {
        setProblemsSolved(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setError(error.message || 'Failed to submit solution. Please try again.');
      setOutput('Error: Could not submit the solution. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-2">CodeEdgeAI</h1>
            <p className="text-xl text-gray-300">Your AI Coding Companion</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg text-gray-300">
                Problems Solved: <span className="text-blue-400 font-bold">{problemsSolved}</span>
              </p>
            </div>
            <button
              onClick={generateNewQuestion}
              disabled={isLoading}
              className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-lg font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>🎯</span>
              <span>{isLoading ? 'Generating...' : 'Generate Question'}</span>
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-lg font-medium"
            >
              <span>🤖</span>
              <span>AI Tutor</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 text-white rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col h-[calc(100vh-12rem)]">
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
          <div className="flex flex-col h-[calc(100vh-12rem)]">
            <Editor
              code={code}
              setCode={setCode}
              runCode={runCode}
              submitSolution={submitSolution}
            />
            <div className="mt-4 flex-1">
              <OutputBox output={output} />
            </div>
          </div>
        </div>
      </div>

      <ChatSidebar 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
        problem={problem}
        code={code}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/code-with-ai" element={<CodeWithAI />} />
      </Routes>
    </Router>
  );
}

export default App; 