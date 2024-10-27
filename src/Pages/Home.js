import React, { useState, useEffect } from 'react';
import LeaderBoard from '../Components/LeaderBoard/LeaderBoard';
import LineChart from '../Components/LineChart/LineChart';
import constants from '../utils/constants';
import {
  updatePlayerRatings,
  updateCountryNumbers,
  updateWinRates,
  addNewPlayer,
  addNewCountry,
  addNewWinRatePlayer,
} from '../utils/testUtils';


import Papa from 'papaparse';
import { active } from 'd3';

const Home = () => {
  const [playerData, setPlayerData] = useState(constants.initialPlayerData);
  const [countryData, setCountryData] = useState(constants.initialCountryData);
  const [winRateData, setWinRateData] = useState(constants.initialWinRateData);
  const [allData, setAllData] = useState({});
  const [playerRatingMap, setPlayerRatingMap] = useState({});
  const [topPlayersAtTimeMap, setTopPlayersAtTimeMap] = useState({});
  const [minMap, setMinMap] = useState({});
  const [maxMap, setMaxMap] = useState({});

  useEffect(() => {
    fetchPlayerData();
}, []);

useEffect(() => {
  if (allData != {}){
    createSeason7DataStruct();
  }
}, [allData]);

const createSeason7DataStruct = () => {
  const usersWithSeason7 = [];

  // Loop through each user in the allData object
  Object.keys(allData).forEach(username => {
      // Check if the user has a 'Season 7' property and it contains data
      if (allData[username]['Season 7'] && allData[username]['Season 7'].length > 0 && playerReachesTop20(username)) {
          usersWithSeason7.push(username);
      }
  });

  let playerRatingMap = {};
  for (let username of usersWithSeason7){
    playerRatingMap[username] = preparePlayerForLineChart(username);
  }
  setPlayerRatingMap(playerRatingMap);

  setTopPlayersAtTimeMap(createTopPlayersAtTimeMap(playerRatingMap));
}

const createTopPlayersAtTimeMap = (playerRatingMapLocal) => {
  const top20Map = {};

// Iterate over each player in the original data
Object.keys(allData).forEach(username => {
  const season7Data = allData[username]['Season 7'];

  if (season7Data) {
    // For each entry in Season 7 data, add it to the corresponding snapshot number
    season7Data.forEach(entry => {
      const { snapshotNumber, skillRating } = entry;

      if (snapshotNumber > 9){
        // Use standard object notation to check and set properties
        if (!top20Map[snapshotNumber]) {
          top20Map[snapshotNumber] = [];
        }

        // Add the player entry along with their rating to the snapshot array
        top20Map[snapshotNumber].push({username, skillRating});
      }
    });
  }
});
let top20MapKeys = Object.keys(top20Map).map(Number).sort((a, b) => a - b);

// Now, sort and trim each snapshot array to retain only the top 20 players by rating
top20MapKeys.forEach(snapshotNumber => {
  top20Map[snapshotNumber] = top20Map[snapshotNumber]
    .sort((a, b) => b.skillRating - a.skillRating) // Sort by skillRating descending
    .slice(0, 20) // Keep only top 20
    .map(player => player.username); // Convert to usernames only
});

let lastSnapshot = top20MapKeys[top20MapKeys.length-1];
top20MapKeys.forEach(snapshotNumber => {
  if (snapshotNumber != lastSnapshot){
    top20Map[snapshotNumber] = top20Map[snapshotNumber].concat(top20Map[snapshotNumber+1]);
  }
});

let top20MapSubSnapshots = {};
let currSubsnapshot = 1;
let largestKey = top20MapKeys[top20MapKeys.length-1];
for (let i of top20MapKeys){
  if (i != largestKey){
    let jStart = currSubsnapshot 
    for (let j =jStart; j < jStart + 50; j++){
      top20MapSubSnapshots[j] = top20Map[i];
      currSubsnapshot++;
    }
  }
}

  let top20MapAllVisiblePlayersAtTime = {};
  let num = 200;
  //let highestTime = Math.max(...exampleMap.keys());
  for (let i of Object.keys(top20MapSubSnapshots)){
    let activePlayers = new Set();
    let jStart = i <= num ? 1 : i-num+1;
    for (let j = jStart; j <= i; j++){
      top20MapSubSnapshots[j].forEach(element => activePlayers.add(element));
    }
    top20MapAllVisiblePlayersAtTime[i] = activePlayers;
  }
  createMinAndMaxMaps(playerRatingMapLocal);
  return top20MapAllVisiblePlayersAtTime;
}

const createMinAndMaxMaps = (playerRatingMapLocal) => {
  const currMinMap = {};
  const currMaxMap = {};

  // Determine the length of the longest array in playerRatingMapLocal
  const maxLength = Math.max(...Object.values(playerRatingMapLocal).map(arr => arr.length));

  // Iterate through each index position (0 to maxLength - 1)
  for (let i = 0; i < maxLength; i++) {
    let minValue = Infinity;
    let maxValue = -Infinity;

    // Go through each player's ratings array at the index `i`
    Object.values(playerRatingMapLocal).forEach(ratings => {
      const rating = ratings[i];

      // Check if the rating is not -1 and is a valid number
      if (rating !== -1 && rating !== undefined) {
        if (rating < minValue) minValue = rating;
        if (rating > maxValue) maxValue = rating;
      }
    });

    // Store the min and max values at the index in the respective maps
    currMinMap[i] = minValue === Infinity ? -1 : Math.floor(minValue); // If no valid min found, set as -1
    currMaxMap[i] = maxValue === -Infinity ? -1 : Math.ceil(maxValue); // If no valid max found, set as -1
  }

  let minMapSmooth = {};
  let maxMapSmooth = {};

  for (let i = 1; i <= maxLength-1; i++) {

    let minRating = Infinity;
    let maxRating = -Infinity;
    if (i <= 200){
      for (let j = i; j > 0; j--){
        if (currMinMap[j] < minRating){
          minRating = currMinMap[j];
        }
        if (currMaxMap[j] > maxRating){
          maxRating = currMaxMap[j];
        }
      }
    } else {
      for (let j = i; j > i-200; j--){
        if (currMinMap[j] < minRating){
          minRating = currMinMap[j];
        }
        if (currMaxMap[j] > maxRating){
          maxRating = currMaxMap[j];
        }
      }
    }
  
    // Store the smoothed values
    minMapSmooth[i] = minRating;
    maxMapSmooth[i] = maxRating;
  }
  setMinMap(smoothLine(minMapSmooth));
  setMaxMap(smoothLine(maxMapSmooth));
};


function smoothLine(dataObj, windowSize = 10) {
  const smoothedData = {};
  const keys = Object.keys(dataObj).map(Number).sort((a, b) => a - b);

  for (let i = 0; i < keys.length; i++) {
    let start = Math.max(0, i - Math.floor(windowSize / 2));
    let end = Math.min(keys.length, i + Math.floor(windowSize / 2) + 1);
    let windowKeys = keys.slice(start, end);
    
    // Calculate the average of the values within the window
    let average = windowKeys.reduce((sum, key) => sum + dataObj[key], 0) / windowKeys.length;
    smoothedData[keys[i]] = average;
  }

  return smoothedData;
}


const playerReachesTop20 = (player) => {
  return allData[player]['Season 7'].filter(p => p.playerRank <= 20).length > 0;
}

const preparePlayerForLineChart = (player) => {
  let ratings = [];
  let season7Data = allData[player]['Season 7'];
  season7Data = season7Data.filter(d => d.snapshotNumber > 9);
  let snapshotCount = 10;
  for (let i = 0; i < season7Data.length; i++){
    if (season7Data[i].snapshotNumber > 9){
      while (snapshotCount != season7Data[i].snapshotNumber && snapshotCount < 185){
        for (let j = 0; j < 50; j++){
          ratings.push(-1);
        }
        snapshotCount++;
      }
      if (season7Data[i].playerRank <= 20 && (i == 0 || season7Data[i - 1].snapshotNumber != snapshotCount - 1) && snapshotCount > 10) {
        // Calculate the new rating values to replace the last 50 elements
        let rating1 = season7Data[i].skillRating - 100;
        let rating2 = season7Data[i].skillRating;
        let step = (rating2 - rating1) / 50;
        let newRatings = [];
      
        for (let j = 0; j < 50; j++) {
          newRatings.push(rating1 + step * j);
        }
      
        // Replace the last 50 elements of the ratings array
        if (ratings.length >= 50) {
          ratings.splice(ratings.length - 50, 50, ...newRatings);
        } else {
          // If there are less than 50 elements, replace what exists and add the rest
          ratings.splice(ratings.length - 50, 50, ...newRatings.slice(0, ratings.length));
          ratings.push(...newRatings.slice(ratings.length));
        }
      }
      if (i !== season7Data.length - 1){
        let enteringTop20 = (season7Data[i].playerRank > 20 && season7Data[i+1].playerRank <= 20);
        // If the next piece of data is in the next snapshot, we want to interpolate between the two values
        if (snapshotCount + 1 == season7Data[i+1].snapshotNumber && ((season7Data[i].playerRank <= 20 && season7Data[i+1].playerRank <= 20) || enteringTop20)){
          let rating1 = season7Data[i].skillRating;
          let rating2 = season7Data[i+1].skillRating;
          let step = (rating2 - rating1)/50;
          for (let j = 0; j < 50; j++){
            ratings.push(rating1 + step * j);
          }
        } else {       // We don't want to graph a single point, so we'll pretend this person wasn't in the top 20
          for (let j = 0; j < 50; j++){
            ratings.push(-1);
          }
        }
      }
      snapshotCount++;
    }
  }
  return ratings;
}

const fetchPlayerData = () => {
    fetch('/colonist_1v1_9_14_2024.csv') // Assuming the file is in the 'public' directory
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                    processPlayerData(results.data);
                },
                error: (error) => {
                    console.error("Error reading CSV file:", error);
                }
            });
        })
        .catch(error => console.error("Error fetching CSV file:", error));
};

const processPlayerData = (data) => {
  let processedData = {};
  let currentSeason = 6;
  let lastTopPlayerRating = null;
  let snapshotNumber = 1;
  let previousCreatedAt = null;
  let currentSnapshotPlayers = [];

  data.forEach((entry, index) => {
      // Parse the relevant numeric fields
      const skillRating = parseFloat(entry.skillRating);
      const createdAt = entry.created_at?.substring(0,13);
      
      // Determine if a new season has started
      if (entry.playerRank === '1') {
          if (lastTopPlayerRating !== null && lastTopPlayerRating - skillRating > 300) {
              currentSeason++; // New season detected
              snapshotNumber = 1; // Reset snapshot count
              previousCreatedAt = null;
          }
          lastTopPlayerRating = skillRating; // Update the top player rating
      }

      // Check if it's a new snapshot
      if (previousCreatedAt && previousCreatedAt !== createdAt) {
          snapshotNumber++;
          currentSnapshotPlayers = [];
      }
      previousCreatedAt = createdAt;

      const username = entry.username;
      if (!processedData[username]) {
          processedData[username] = {};
      }
      if (!processedData[username][`Season ${currentSeason}`]) {
          processedData[username][`Season ${currentSeason}`] = [];
      }
      // It's possible some players can be on the leaderboard twice. Only add new entry for nsapshot if they are not already in this snapshot
      if (!currentSnapshotPlayers.includes(username)){
        // Add the entry data to the specific season
          const userEntry = {
            countryCode: entry.countryCode,
            division: parseInt(entry.division),
            playerRank: parseInt(entry.playerRank),
            skillRating: skillRating,
            totalGamesPlayed: parseInt(entry.totalGamesPlayed),
            winRate: parseFloat(entry.winRate),
            snapshotNumber: snapshotNumber,
            createdAt: entry.created_at
        };
        processedData[username][`Season ${currentSeason}`].push(userEntry);

        currentSnapshotPlayers.push(username);
      }
  });

  setAllData(processedData);
  console.log("Processed Data:", processedData);
};

  useEffect(() => {
    const interval = setInterval(() => {

      let updatedPlayerData = updatePlayerRatings(playerData);
      let updatedCountryData = updateCountryNumbers(countryData);
      let updatedWinRateData = updateWinRates(winRateData);

      // Occasionally add a new player and ensure 10 players
      if (Math.random() < 0.2) {
        updatedPlayerData = addNewPlayer(updatedPlayerData);
        updatedCountryData = addNewCountry(updatedCountryData);
        updatedWinRateData = addNewWinRatePlayer(updatedWinRateData);
      }
      if (Object.keys(updatedPlayerData).length < 10) {
        updatedPlayerData = addNewPlayer(updatedPlayerData);
      }
      if (Object.keys(updatedCountryData).length < 5) {
        updatedCountryData = addNewCountry(updatedCountryData);
      }
      if (Object.keys(updatedWinRateData).length < 5) {
        updatedWinRateData = addNewWinRatePlayer(updatedWinRateData);
      }

      setPlayerData({ ...updatedPlayerData });
      setCountryData({ ...updatedCountryData });
      setWinRateData({ ...updatedWinRateData });
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
