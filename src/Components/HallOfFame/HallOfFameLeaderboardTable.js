import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboardTable.css';
import HallOfFameLeaderboardTableEntry from './HallOfFameLeaderboardTableEntry';


const HallOfFameLeaderboardTable = ({ entries }) => {
  return (
    <div className='tableContainer'>
        <table className='hallOfFameLeaderboardTable'>
            {
                entries?.map((entry) => (
                    <HallOfFameLeaderboardTableEntry
                        rank={entry.rank}
                        name={entry.name}
                        value={entry.value}
                    />
                ))
            }
        </table>
    </div>
  );
};

export default HallOfFameLeaderboardTable;
