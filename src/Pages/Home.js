import React, { useState, useEffect } from 'react';
import LeaderBoard from '../Components/LeaderBoard/LeaderBoard';
import LineChart from '../Components/LineChart/LineChart';
import constants from '../utils/constants';
import {
  updateLeaderBoardCharts
} from '../utils/testUtils';
import {
  read1v1DataFromFile
} from '../utils/importDataUtils';
import {
  createSeason7DataStruct
} from '../utils/prepareLineChartUtils';

const Home = () => {
  const [playerData, setPlayerData] = useState(constants.initialPlayerData);
  const [countryData, setCountryData] = useState(constants.initialCountryData);
  const [winRateData, setWinRateData] = useState(constants.initialWinRateData);
  const [allData, setAllData] = useState(null);
  const [playerRatingMap, setPlayerRatingMap] = useState(null);
  const [topPlayersAtTimeMap, setTopPlayersAtTimeMap] = useState(null);
  const [minMap, setMinMap] = useState(null);
  const [maxMap, setMaxMap] = useState(null);

  useEffect(() => {
    read1v1DataFromFile(setAllData);
}, []);

useEffect(() => {
  if (allData){
    createSeason7DataStruct(allData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap);
  }
}, [allData]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateLeaderBoardCharts(playerData, countryData, winRateData, setPlayerData, setCountryData, setWinRateData);
    }, 2000); // Update every 2 seconds    
    return () => {
      clearInterval(interval);
    };
  }, [playerData, countryData, winRateData]);

  return (
    <div className='visContainer'>
        <LineChart playerData={playerRatingMap} topPlayersAtTimeMap={topPlayersAtTimeMap} minMap={minMap} maxMap={maxMap}/>
        <div className='supportingVisContainer'>
            <div className='leaderboardItem leaderboardItem1'>
            <LeaderBoard title="Top Rating" data={playerData} leaderBoardMetric="rating" size={10}/>
            </div>

            <div className='leaderboardItem leaderboardItem2'>
            <LeaderBoard title="Top Win Rate" data={winRateData} leaderBoardMetric="winRate" size={5}/>
            </div>

            <div className='leaderboardItem leaderboardItem3'>
              <LeaderBoard title="Top Countries" data={countryData} leaderBoardMetric="countryNumber" size={5}/>
            </div>
        </div>
    </div>
  );
};

export default Home;
