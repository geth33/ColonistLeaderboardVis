import React, { useState, useEffect } from 'react';
import LeaderBoard from './LeaderBoard';
import LineChart from './LineChart';
import constants from './constants';
import Papa from 'papaparse';
import { active } from 'd3';


const initialPlayerData = {
  Julia: { rating: 1540, winRate: 32, country: 'UK' },
  Bill: { rating: 1530, winRate: 32, country: 'UK' },
  Alice: { rating: 1520, winRate: 55, country: 'USA' },
  Bob: { rating: 1480, winRate: 60, country: 'Canada' },
  Paul: { rating: 1470, winRate: 44, country: 'UK' },
  Charlie: { rating: 1450, winRate: 58, country: 'UK' },
  Hannah: { rating: 1420, winRate: 62, country: 'USA' },
  Quinn: { rating: 1399, winRate: 63, country: 'UK' },
  Sam: { rating: 1384, winRate: 50, country: 'UK' },
  Eva: { rating: 1370, winRate: 52, country: 'UK' },
};

const initialCountryData = {
  USA: { rating: 1520, winRate: 55, countryNumber: 30 },
  Canada: { rating: 1480, winRate: 60, countryNumber: 27 },
  UK: { rating: 1450, winRate: 58, countryNumber: 14 },
  China: { rating: 1450, winRate: 58, countryNumber: 29 },
  Australia: { rating: 1450, winRate: 58, countryNumber: 7 },
};

const initialWinRateData = {
  Alice: { rating: 1520, winRate: 55, country: 'USA' },
  Bob: { rating: 1480, winRate: 60, country: 'Canada' },
  Charlie: { rating: 1450, winRate: 58, country: 'UK' },
  Hannah: { rating: 1420, winRate: 62, country: 'USA' },
  Eva: { rating: 1370, winRate: 52, country: 'UK' },
};

const Home = () => {
  const [playerData, setPlayerData] = useState(initialPlayerData);
  const [countryData, setCountryData] = useState(initialCountryData);
  const [winRateData, setWinRateData] = useState(initialWinRateData);
  const [allData, setAllData] = useState({});
  const [playerRatingMap, setPlayerRatingMap] = useState({});
  const [topPlayersAtTimeMap, setTopPlayersAtTimeMap] = useState({});
  const [minMap, setMinMap] = useState({});


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
  console.log(usersWithSeason7)

  for (let username of usersWithSeason7){
    playerRatingMap[username] = preparePlayerForLineChart(username);
  }
  setPlayerRatingMap(playerRatingMap);

  setTopPlayersAtTimeMap(createTopPlayersAtTimeMap(playerRatingMap));

  console.log(playerRatingMap);
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
console.log(top20Map);
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

console.log(top20Map);


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
  console.log(top20MapSubSnapshots);

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
  console.log(top20MapAllVisiblePlayersAtTime);

  setMinMap(createMinMap(top20MapAllVisiblePlayersAtTime, playerRatingMapLocal));
  return top20MapAllVisiblePlayersAtTime;
}

const createMinMap = (top20MapAllVisiblePlayersAtTime, playerRatingMapLocal) => {
  let minMapForVisiblePlayers = {};
  let keys = Object.keys(top20MapAllVisiblePlayersAtTime);
  console.log(keys);
  for (let key of keys){
    let currPlayers = [...top20MapAllVisiblePlayersAtTime[key]];

    let minRating = 10000;
    for (let i=0; i < 20; i++){
      let value = playerRatingMapLocal[currPlayers[i]][key];
      if (key == 8649){
        console.log(value);
      }
      if (value < minRating && value != -1) {
        minRating = value;
      }
    }
    minMapForVisiblePlayers[key] = minRating;
  }
  console.log(minMapForVisiblePlayers)
  let minMapSmooth = {};
  for (let i = 1; i <= keys.length; i++){
    let minRating = 10000;
    if (i <= 200){
      for (let j = i; j > 0; j--){
        if (minMapForVisiblePlayers[j] < minRating){
          minRating = minMapForVisiblePlayers[j];
        }
      }
    } else {
      for (let j = i; j > i-200; j--){
        if (minMapForVisiblePlayers[j] < minRating){
          minRating = minMapForVisiblePlayers[j];
        }
      }
    }
    minMapSmooth[i] = minRating;
  }
  console.log(minMapSmooth);
  let smooth = smoothLine(minMapSmooth);
  console.log(smooth);
  return smooth;
}

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
        console.log(player);
        console.log(snapshotCount);
        console.log(season7Data[i]);
        console.log(snapshotCount - 1);
      
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

  // Function to randomly add or subtract 10 from each user's rating
  const updatePlayerRatings = () => {
    const updatedData = { ...playerData };
    Object.keys(updatedData).forEach((key) => {
      const change = Math.random() < 0.5 ? -10 : 10;
      updatedData[key].rating = updatedData[key].rating + change;
    });
    return updatedData;
  };

  // Function to add or subtract 2 from each country's countryNumber
  const updateCountryNumbers = () => {
    const updatedCountryData = { ...countryData };
    Object.keys(updatedCountryData).forEach((country) => {
      const change = Math.random() < 0.5 ? -2 : 2;
      updatedCountryData[country].countryNumber = updatedCountryData[country].countryNumber + change;
    });
    return updatedCountryData;
  };

  // Function to add or subtract 2 from each user's winRate
  const updateWinRates = () => {
    const updatedWinRateData = { ...winRateData };
    Object.keys(updatedWinRateData).forEach((key) => {
      const change = Math.random() < 0.5 ? -2 : 2;
      updatedWinRateData[key].winRate = updatedWinRateData[key].winRate + change;
    });
    return updatedWinRateData;
  };

  const addNewPlayer = (currentData, attempt = 0) => {
    const newUserNames = ['Alfredo', 'Maggie', 'Oliver', 'Nina', 'Zack', 'Sophia', 'Phil', 'Andreas', 'Tyrone', 'Gloria', 'Jesus'];
    const maxAttempts = newUserNames.length; // Prevent infinite recursion
  
    if (attempt >= maxAttempts) {
      console.warn("Max attempts reached. No new player added.");
      return currentData;
    }
  
    const randomName = newUserNames[Math.floor(Math.random() * newUserNames.length)];
  
    if (Object.keys(currentData).length >= 10) {
      const lowestRatedPlayer = Object.keys(currentData).reduce((lowest, player) => {
        return currentData[player].rating < currentData[lowest].rating ? player : lowest;
      }, Object.keys(currentData)[0]);
  
      delete currentData[lowestRatedPlayer];
    }
  
    if (!(randomName in currentData)) {
      currentData[randomName] = {
        rating: 1500 + Math.floor(Math.random() * 100),
        winRate: 50,
        country: 'Unknown',
      };
    } else {
      return addNewPlayer(currentData, attempt + 1);
    }
  
    return currentData;
  };

  const addNewCountry = (currentCountryData) => {
    const newCountryNames = ['Germany', 'France', 'Brazil', 'India', 'Russia'];
    const randomCountry = newCountryNames[Math.floor(Math.random() * newCountryNames.length)];

    // If there are already 5 countries, remove the one with the lowest countryNumber
    if (Object.keys(currentCountryData).length >= 5) {
      const lowestCountry = Object.keys(currentCountryData).reduce((lowest, country) => {
        return currentCountryData[country].countryNumber < currentCountryData[lowest].countryNumber ? country : lowest;
      }, Object.keys(currentCountryData)[0]);

      delete currentCountryData[lowestCountry]; // Remove the lowest country
    }

    // Add the new country, only if it doesn't already exist
    if (!(randomCountry in currentCountryData)) {
      currentCountryData[randomCountry] = {
        rating: 1500 + Math.floor(Math.random() * 100),
        winRate: Math.floor(Math.random() * 100),
        countryNumber: 10 + Math.floor(Math.random() * 20),
      };
    }

    return currentCountryData;
  };

  const addNewWinRatePlayer = (currentWinRateData) => {
    const newUserNames = ['Alfredo', 'Maggie', 'Oliver', 'Nina', 'Zack', 'Sophia', 'Phil', 'Andreas', 'Tyrone', 'Gloria', 'Jesus'];
    const randomName = newUserNames[Math.floor(Math.random() * newUserNames.length)];

    // If there are already 5 users, remove the one with the lowest winRate
    if (Object.keys(currentWinRateData).length >= 5) {
      const lowestWinRatePlayer = Object.keys(currentWinRateData).reduce((lowest, player) => {
        return currentWinRateData[player].winRate < currentWinRateData[lowest].winRate ? player : lowest;
      }, Object.keys(currentWinRateData)[0]);

      delete currentWinRateData[lowestWinRatePlayer]; // Remove the player with the lowest winRate
    }

    // Add the new player, only if they don't already exist
    if (!(randomName in currentWinRateData)) {
      currentWinRateData[randomName] = {
        rating: 1500 + Math.floor(Math.random() * 100),
        winRate: 50,
        country: 'Unknown',
      };
    }

    return currentWinRateData;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      let updatedPlayerData = updatePlayerRatings();
      let updatedCountryData = updateCountryNumbers();
      let updatedWinRateData = updateWinRates();

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
        <LineChart playerData={playerRatingMap} topPlayersAtTimeMap={topPlayersAtTimeMap} minMap={minMap}/>
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
