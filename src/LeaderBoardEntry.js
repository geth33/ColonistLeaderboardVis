import React from 'react';
import './LeaderBoardEntry.css'; // Import CSS for styling

const LeaderBoardEntry = ({ rank, name, value }) => {
  return (
    <li className='leaderBoardRow' data-name={name}> {/* Add data-name attribute */}
      <div className='rowContent'>
        <span className='rank'>{rank}</span>
        <span className='name'>{name}</span>
        <span className='value'>{value}</span>
      </div>
    </li>
  );
};

export default LeaderBoardEntry;
