import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('# Write your code here\n');
  const [output, setOutput] = useState('');
  const [category, setCategory] = useState('data_structures');
  const [concept, setConcept] = useState('arrays');
  const [difficulty, setDifficulty] = useState('medium');
  const [problemsSolved, setProblemsSolved] = useState(0);

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
      const response = await fetch('http://localhost:5000/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          concept,
          difficulty
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const data = await response.json();
      setProblem(data.problem);
      setCode('# Write your code here\n');
      setOutput('');
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  const runCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to run code');
      }

      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  const submitSolution = async () => {
    try {
      const response = await fetch('http://localhost:5000/submit-solution', {
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
        throw new Error('Failed to submit solution');
      }

      const data = await response.json();
      setOutput(data.message);
      if (data.correct) {
        setProblemsSolved(prev => prev + 1);
      }
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">CodeEdgeAI</h1>
          <p className="text-xl text-gray-300">Your AI Coding Companion</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-12rem)]">
          <div className="flex flex-col h-full">
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
          <div className="flex flex-col h-full">
            <Editor
              code={code}
              setCode={setCode}
              runCode={runCode}
              submitSolution={submitSolution}
            />
            <div className="mt-4">
              <OutputBox output={output} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={generateNewQuestion}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-lg font-medium"
          >
            <span>🎯</span>
            <span>Generate Question</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg text-gray-300">
            Problems Solved: <span className="text-blue-400 font-bold">{problemsSolved}</span>
          </p>
        </div>
      </div>

      <ChatSidebar isOpen={showChat} onClose={() => setShowChat(false)} />
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