import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboard.css';
import LeaderboardTopper from './LeaderboardTopper';
import HallOfFameLeaderboardTable from './HallOfFameLeaderboardTable';

const HallOfFameLeaderboard = ({ title, leaderboardEntries}) => {
  return (
    <div className='hallOfFameLeaderboardContainer'>
        <h3 className='hallOfFameLeaderboardTitle'>{title}</h3>
        <div className='leaderboardTopperContainerList'>
            <LeaderboardTopper rank={2} name={leaderboardEntries[1].name} value={leaderboardEntries[1].value}/>
            <LeaderboardTopper rank={1} name={leaderboardEntries[0].name} value={leaderboardEntries[0].value}/>
            <LeaderboardTopper rank={3} name={leaderboardEntries[2].name} value={leaderboardEntries[2].value}/>
        </div>
        <HallOfFameLeaderboardTable entries={leaderboardEntries.slice(3)}/>
    </div>
  );
};

export default HallOfFameLeaderboard;
