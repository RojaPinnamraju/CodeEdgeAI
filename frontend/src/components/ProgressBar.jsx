import React from 'react';

const ProgressBar = ({ solvedProblems }) => {
    return (
        <div className="w-full p-2 bg-gray-800 rounded-lg shadow">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Problems Solved</span>
                <span className="text-xl font-bold text-blue-400">{solvedProblems}</span>
            </div>
        </div>
    );
};

export default ProgressBar; 