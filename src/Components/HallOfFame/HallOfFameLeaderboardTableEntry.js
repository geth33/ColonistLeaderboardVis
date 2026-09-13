import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboardTableEntry.css';

const HallOfFameLeaderboardTableEntry = ({ rank, name, value }) => {
  return (
    <tr className='hallOfFameLeaderboardTableEntry'>
        <td>{rank}</td>
        <td>{name}</td>
        <td>{value}</td>
    </tr>
  );
};

export default HallOfFameLeaderboardTableEntry;
