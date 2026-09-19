import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboard.css';
import LeaderboardTopper from './LeaderboardTopper';
import HallOfFameLeaderboardTable from './HallOfFameLeaderboardTable';

const HallOfFameLeaderboard = ({ title, leaderboardEntries, property, suffix, secondaryProperty, secondarySuffix}) => {
  return (
    <div className='hallOfFameLeaderboardContainer'>
        <div className='leaderboardTopperContainerList'>
            <LeaderboardTopper rank={2} name={leaderboardEntries[1].username} value={leaderboardEntries[1][property]} suffix={suffix} secondaryValue={leaderboardEntries[1][secondaryProperty]} secondarySuffix={secondarySuffix}/>
            <LeaderboardTopper rank={1} name={leaderboardEntries[0].username} value={leaderboardEntries[0][property]} suffix={suffix} secondaryValue={leaderboardEntries[0][secondaryProperty]} secondarySuffix={secondarySuffix}/>
            <LeaderboardTopper rank={3} name={leaderboardEntries[2].username} value={leaderboardEntries[2][property]} suffix={suffix} secondaryValue={leaderboardEntries[2][secondaryProperty]} secondarySuffix={secondarySuffix}/>
        </div>
        <HallOfFameLeaderboardTable entries={leaderboardEntries.slice(3)} property={property} suffix={suffix} secondaryProperty={secondaryProperty} secondarySuffix={secondarySuffix}/>
    </div>
  );
};

export default HallOfFameLeaderboard;
