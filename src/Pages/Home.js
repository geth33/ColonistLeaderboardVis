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
  createSeasonDataStruct,
  generateSnapshotMaps
} from '../utils/prepareLineChartUtils';

const Home = () => {
  const [allData, setAllData] = useState(null);
  const [playerRatingMap, setPlayerRatingMap] = useState(null);
  const [topPlayersAtTimeMap, setTopPlayersAtTimeMap] = useState(null);
  const [minMap, setMinMap] = useState(null);
  const [maxMap, setMaxMap] = useState(null);
  const [top10RankMap, setTop10RankMap] = useState(null);
  const [top5WinRateMap, setTop5WinRateMap] = useState(null);
  const [top5CountryMap, setTop5CountryMap] = useState(null);
  const [currSnapshot, setCurrSnapshot] = useState(1);

  const season = 7;
  const numOfTicksOnGraph = 200;
  const lineChartSpeed = 25;
  const numOfPlayersOnChart = 10;
  const startingSnapshot = 10;

  useEffect(() => {
    read1v1DataFromFile(setAllData);
}, []);

useEffect(() => {
  if (allData){
    createSeasonDataStruct(allData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, season, numOfPlayersOnChart, startingSnapshot, numOfTicksOnGraph);
    const {top10RankMap, top5WinRateMap, top5CountryMap} = generateSnapshotMaps(allData, season);
    setTop10RankMap(top10RankMap);
    setTop5WinRateMap(top5WinRateMap);
    setTop5CountryMap(top5CountryMap);
  }
}, [allData]);

useEffect(() => {
  const handleTickEvent = (e) => {
    const { snapshot } = e.detail;
    setCurrSnapshot(startingSnapshot + snapshot);
    console.log(snapshot);
  };

  window.addEventListener("nextSnapshot", handleTickEvent);

  return () => window.removeEventListener("nextSnapshot", handleTickEvent);
}, []);

  return (
    <div className='visContainer'>
        <LineChart playerData={playerRatingMap} topPlayersAtTimeMap={topPlayersAtTimeMap} 
        minMap={minMap} maxMap={maxMap} numOfTicksOnGraph={numOfTicksOnGraph} lineChartSpeed={lineChartSpeed}/>
        <div className='supportingVisContainer'>
            <div className='leaderboardItem leaderboardItem1'>
            <LeaderBoard title="Top Rating" data={top10RankMap} leaderBoardMetric="skillRating" size={10} currSnapshot={currSnapshot}/>
            </div>

            <div className='leaderboardItem leaderboardItem2'>
            <LeaderBoard title="Top Win Rate" data={top5WinRateMap} leaderBoardMetric="winRate" size={5} currSnapshot={currSnapshot}/>
            </div>

            <div className='leaderboardItem leaderboardItem3'>
              <LeaderBoard title="Top Countries" data={top5CountryMap} leaderBoardMetric="count" size={5} currSnapshot={currSnapshot}/>
            </div>
        </div>
    </div>
  );
};

export default Home;
