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
    <div className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-blue-400">Problem Statement</h2>
        <div className="flex space-x-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(categories).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
          <select
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(categories[category].concepts).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(difficulties).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4">
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-200">{problem}</pre>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard; 