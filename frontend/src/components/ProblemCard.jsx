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
      <div className="flex space-x-4 mb-4">
        {/* Category Dropdown */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setConcept(Object.keys(categories[e.target.value].concepts)[0]);
            }}
            className="w-full p-2 bg-gray-700 text-gray-200 rounded text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(categories).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        {/* Concept Dropdown */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-300 mb-1">Concept</label>
          <select
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-200 rounded text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(categories[category].concepts).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-300 mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-200 rounded text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(difficulties).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="flex-1 border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900">
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-lg font-bold text-blue-400 mb-4">Problem Statement</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 text-sm whitespace-pre-wrap">{problem}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard; 