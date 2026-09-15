import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboardTable.css';
import HallOfFameLeaderboardTableEntry from './HallOfFameLeaderboardTableEntry';


const HallOfFameLeaderboardTable = ({ entries, property }) => {
  return (
    <div className='tableContainer'>
        <table className='hallOfFameLeaderboardTable'>
            {
                entries?.map((entry) => (
                    <HallOfFameLeaderboardTableEntry
                        rank={entry.rank}
                        name={entry.username}
                        value={entry[property]}
                    />
                ))
            }
        </table>
    </div>
  );
};

export default HallOfFameLeaderboardTable;
