import React from 'react';
import './LeaderBoard.css'; // Import CSS for styling
import LeaderBoardEntry from './LeaderBoardEntry';

const LeaderBoard = ({ title, data, leaderBoardMetric }) => {
  // Extract and sort data based on the provided leaderboard metric
  const sortedData = Object.keys(data)
    .map((key) => ({
      name: key,
      value: data[key][leaderBoardMetric],
    }))
    .sort((a, b) => b.value - a.value); // Sort in descending order

  return (
    <div className='leaderboard'>
      <h3>{title}</h3>
      <ul>
        {sortedData.map((entry, index) => (
            <LeaderBoardEntry index={index} rank={index + 1} name={entry.name} value={entry.value}/>
        ))}
      </ul>
    </div>
  );
};

export default LeaderBoard;