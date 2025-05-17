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
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">Problem Statement</h2>
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-300 whitespace-pre-wrap">{problem}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(categories).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Concept</label>
          <select
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(categories[category].concepts).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(difficulties).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard; 