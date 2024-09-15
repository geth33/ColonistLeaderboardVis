import React from 'react';
import './LeaderBoardEntry.css'; // Import CSS for styling

const LeaderBoardEntry = ({ index, rank, name, value }) => {

  return (
          <li key={index} className='leaderBoardRow'>
            <span className='rank'>{rank}</span>
            <span className='name'>{name}</span>
            <span className='value'>{value}</span>
          </li>
  );
};

export default LeaderBoardEntry;