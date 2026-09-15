import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboardTableEntry.css';

const HallOfFameLeaderboardTableEntry = ({ rank, name, value }) => {
  return (
    <tr className='hallOfFameLeaderboardTableEntry'>
        <td style={{width: '15%'}}>{rank}</td>
        <td style={{width: '70%'}}>{name}</td>
        <td style={{width: '15%'}}>{value}</td>
    </tr>
  );
};

export default HallOfFameLeaderboardTableEntry;
