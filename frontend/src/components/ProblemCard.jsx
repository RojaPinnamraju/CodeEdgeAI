import React from 'react';

const ProblemCard = ({
  problem,
  category,
  concept,
  difficulty,
  setCategory,
  setConcept,
  setDifficulty,
  categories,
  difficulties
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold text-blue-400">Problem Settings</h2>
        
        {/* Category Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categories).map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  setCategory(key);
                  setConcept(Object.keys(value.concepts)[0]);
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  category === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>

        {/* Concept Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Concept</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(categories[category].concepts).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setConcept(key)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  concept === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(difficulties).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  difficulty === key
                    ? key === 'easy'
                      ? 'bg-green-600 text-white'
                      : key === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-blue-400">Problem Statement</h2>
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-200 whitespace-pre-wrap">{problem}</p>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard; 