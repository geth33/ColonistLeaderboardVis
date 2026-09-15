import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboard.css';
import LeaderboardTopper from './LeaderboardTopper';
import HallOfFameLeaderboardTable from './HallOfFameLeaderboardTable';

const HallOfFameLeaderboard = ({ title, leaderboardEntries, property}) => {
  return (
    <div className='hallOfFameLeaderboardContainer'>
        <div className='leaderboardTopperContainerList'>
            <LeaderboardTopper rank={2} name={leaderboardEntries[1].username} value={leaderboardEntries[1][property]}/>
            <LeaderboardTopper rank={1} name={leaderboardEntries[0].username} value={leaderboardEntries[0][property]}/>
            <LeaderboardTopper rank={3} name={leaderboardEntries[2].username} value={leaderboardEntries[2][property]}/>
        </div>
        <HallOfFameLeaderboardTable entries={leaderboardEntries.slice(3)} property={property}/>
    </div>
  );
};

export default HallOfFameLeaderboard;
