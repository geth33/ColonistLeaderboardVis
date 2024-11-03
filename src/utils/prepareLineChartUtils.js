export const createSeasonDataStruct = (allData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, season, numOfPlayersOnChart, startingSnapshot, numOfTicksOnGraph) => {
    const playersOnGraph = [];
    // Loop through each user in the allData object
    Object.keys(allData).forEach(username => {
        if (allData[username]['Season ' + season] && allData[username]['Season ' + season].length > 0 && playerAppearsInGraph(allData, username, season, numOfPlayersOnChart)) {
            playersOnGraph.push(username);
        }
    });
  
    let playerRatingMap = {};
    for (let username of playersOnGraph){
      playerRatingMap[username] = preparePlayerForLineChart(allData, username, season, numOfPlayersOnChart, startingSnapshot);
    }
    setPlayerRatingMap(playerRatingMap);
    setTopPlayersAtTimeMap(createTopPlayersAtTimeMap(allData, playerRatingMap, setMinMap, setMaxMap, startingSnapshot, season, numOfPlayersOnChart, numOfTicksOnGraph));
  }
  
  export const createTopPlayersAtTimeMap = (allData, playerRatingMapLocal, setMinMap, setMaxMap, startingSnapshot, season, numOfPlayersOnChart, numOfTicksOnGraph) => {
    const topPlayerMap = {};
  
  // Iterate over each player in the original data
  Object.keys(allData).forEach(username => {
    const currSeasonData = allData[username]['Season ' + season];
  
    if (currSeasonData) {
      // For each entry in season, add it to the corresponding snapshot number
      currSeasonData.forEach(entry => {
        const { snapshotNumber, skillRating, playerRank } = entry;
  
        if (snapshotNumber >= startingSnapshot){
          // Use standard object notation to check and set properties
          if (!topPlayerMap[snapshotNumber]) {
            topPlayerMap[snapshotNumber] = [];
          }
  
          // Add the player entry along with their rating to the snapshot array
          topPlayerMap[snapshotNumber].push({username, playerRank});
        }
      });
    }
  });
  let topPlayerMapKeys = Object.keys(topPlayerMap).map(Number).sort((a, b) => a - b);
  
  // Now, sort and trim each snapshot array to retain only the top players by rating
  topPlayerMapKeys.forEach(snapshotNumber => {
    topPlayerMap[snapshotNumber] = topPlayerMap[snapshotNumber]
      .sort((a, b) => a.playerRank - b.playerRank) // Sort by skillRating descending
      .slice(0, numOfPlayersOnChart) // Keep only top players
      .map(player => player.username); // Convert to usernames only
  });
  console.log(numOfPlayersOnChart);
  console.log(topPlayerMap);
  
  let lastSnapshot = topPlayerMapKeys[topPlayerMapKeys.length-1];
  topPlayerMapKeys.forEach(snapshotNumber => {
    if (snapshotNumber != lastSnapshot){
      topPlayerMap[snapshotNumber] = topPlayerMap[snapshotNumber].concat(topPlayerMap[snapshotNumber+1]);
    }
  });

  console.log(topPlayerMap);
  
  let topPlayerMapSubSnapshots = {};
  let currSubsnapshot = 1;
  let largestKey = topPlayerMapKeys[topPlayerMapKeys.length-1];
  for (let i of topPlayerMapKeys){
    if (i != largestKey){
      let jStart = currSubsnapshot 
      for (let j =jStart; j < jStart + 50; j++){
        topPlayerMapSubSnapshots[j] = topPlayerMap[i];
        currSubsnapshot++;
      }
    }
  }
  
    let topPlayerMapAllVisiblePlayersAtTime = {};
    for (let i of Object.keys(topPlayerMapSubSnapshots)){
      let activePlayers = new Set();
      let jStart = i <= numOfTicksOnGraph ? 1 : i-numOfTicksOnGraph+1;
      for (let j = jStart; j <= i; j++){
        topPlayerMapSubSnapshots[j].forEach(element => activePlayers.add(element));
      }
      topPlayerMapAllVisiblePlayersAtTime[i] = activePlayers;
    }
    createMinAndMaxMaps(playerRatingMapLocal, setMinMap, setMaxMap, numOfTicksOnGraph);
    return topPlayerMapAllVisiblePlayersAtTime;
  }
  
  export const createMinAndMaxMaps = (playerRatingMapLocal, setMinMap, setMaxMap, numOfTicksOnGraph) => {
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
      if (i <= numOfTicksOnGraph){
        for (let j = i; j > 0; j--){
          if (currMinMap[j] < minRating){
            minRating = currMinMap[j];
          }
          if (currMaxMap[j] > maxRating){
            maxRating = currMaxMap[j];
          }
        }
      } else {
        for (let j = i; j > i-numOfTicksOnGraph; j--){
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
  
  
  export function smoothLine(dataObj, windowSize = 10) {
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
  
  
  export const playerAppearsInGraph = (allData, player, season, numOfPlayersOnChart) => {
    return allData[player]['Season '+season].filter(p => p.playerRank <= numOfPlayersOnChart).length > 0;
  }
  
  export const preparePlayerForLineChart = (allData, player, season, numOfPlayersOnChart, startingSnapshot) => {
    let ratings = [];
    let seasonData = allData[player]['Season ' + season];
    seasonData = seasonData.filter(d => d.snapshotNumber > startingSnapshot-1);
    let snapshotCount = startingSnapshot;
    for (let i = 0; i < seasonData.length; i++){
      if (seasonData[i].snapshotNumber > startingSnapshot-1){
        while (snapshotCount != seasonData[i].snapshotNumber && snapshotCount < 185){
          for (let j = 0; j < 50; j++){
            ratings.push(-1);
          }
          snapshotCount++;
        }
        if (seasonData[i].playerRank <= numOfPlayersOnChart && (i == 0 || seasonData[i - 1].snapshotNumber != snapshotCount - 1) && snapshotCount > startingSnapshot) {
          // Calculate the new rating values to replace the last 30 elements
          let rating1 = seasonData[i].skillRating - 100;
          let rating2 = seasonData[i].skillRating;
          let step = (rating2 - rating1) / 50;
          let newRatings = [];
        
          for (let j = 0; j < 50; j++) {
            newRatings.push(rating1 + step * j);
          }
        
          // Replace the last 30 elements of the ratings array
          if (ratings.length >= 50) {
            ratings.splice(ratings.length - 50, 50, ...newRatings);
          } else {
            // If there are less than 30 elements, replace what exists and add the rest
            ratings.splice(ratings.length - 50, 50, ...newRatings.slice(0, ratings.length));
            ratings.push(...newRatings.slice(ratings.length));
          }
        }
        if (i !== seasonData.length - 1){
          let enteringTop = (seasonData[i].playerRank > numOfPlayersOnChart && seasonData[i+1].playerRank <= numOfPlayersOnChart);
          // If the next piece of data is in the next snapshot, we want to interpolate between the two values
          if (snapshotCount + 1 == seasonData[i+1].snapshotNumber && ((seasonData[i].playerRank <= numOfPlayersOnChart && seasonData[i+1].playerRank <= numOfPlayersOnChart) || enteringTop)){
            let rating1 = seasonData[i].skillRating;
            let rating2 = seasonData[i+1].skillRating;
            let step = (rating2 - rating1)/50;
            for (let j = 0; j < 50; j++){
              ratings.push(rating1 + step * j);
            }
          } else {       // We don't want to graph a single point, so we'll pretend this person wasn't in the top
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

  export const generateSnapshotMaps = (data, season, startingSnapshot) => {
    const top10RankMap = {};
    const top5WinRateMap = {};
    const timeInFirstPlaceMap = {};
  
    Object.keys(data).forEach(username => {
      const userSeasons = data[username];
  
      // Ensure the specified season exists for the user
      if (userSeasons["Season " + season]) {
        userSeasons["Season " + season].forEach(entry => {
          const { playerRank, snapshotNumber, winRate, countryCode } = entry;
  
          // Initialize snapshot entry arrays if they don’t exist
          if (!top10RankMap[snapshotNumber]) top10RankMap[snapshotNumber] = [];
          if (!top5WinRateMap[snapshotNumber]) top5WinRateMap[snapshotNumber] = [];
          if (!timeInFirstPlaceMap[snapshotNumber]) timeInFirstPlaceMap[snapshotNumber] = {};
  
          // Add to top10RankMap if playerRank is between 1 and 10
          if (playerRank >= 1 && playerRank <= 10) {
            top10RankMap[snapshotNumber].push({ username, ...entry });
          }
  
          // Add to top5WinRateMap (consider all entries for win rate comparison)
          top5WinRateMap[snapshotNumber].push({ username, ...entry, winRate: parseFloat(entry.winRate.toFixed(1))});
        });
      }
    });
  
    // Process and finalize each map to retain only the top players/countries as specified
    Object.keys(top10RankMap).forEach(snapshotNumber => {
      // Sort by playerRank and keep top 10, retaining full entry data
      top10RankMap[snapshotNumber] = top10RankMap[snapshotNumber]
        .sort((a, b) => a.playerRank - b.playerRank)
        .slice(0, 10); // Keep the full entries
    });
  
    Object.keys(top5WinRateMap).forEach(snapshotNumber => {
      // Sort by winRate and keep top 5, retaining full entry data
      top5WinRateMap[snapshotNumber] = top5WinRateMap[snapshotNumber]
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 5); // Keep the full entries
    });

    let previousFirstPlace = null;
    let consecutiveFirstPlaceCount = 0;
    const firstPlaceStreaks = {}; // Keeps track of total first-place streak for each player

    Object.keys(top10RankMap).forEach(snapshotNumber => {
      if (snapshotNumber >= startingSnapshot){
        const firstPlacePlayer = top10RankMap[snapshotNumber][0]?.username;

        // Initialize first place streaks for the current snapshot if needed
        if (!timeInFirstPlaceMap[snapshotNumber]) {
            timeInFirstPlaceMap[snapshotNumber] = [];
        }

        if (firstPlacePlayer) {
            // Update consecutive count for the current first-place player
            if (firstPlacePlayer === previousFirstPlace) {
                consecutiveFirstPlaceCount += 0.5;
            } else {
              if (firstPlaceStreaks[firstPlacePlayer]){
                consecutiveFirstPlaceCount = firstPlaceStreaks[firstPlacePlayer] + 0.5;
              } else {
                consecutiveFirstPlaceCount = 0.5;
              }
            }

            // Update or initialize the streak for the current player
            firstPlaceStreaks[firstPlacePlayer] = consecutiveFirstPlaceCount;

            // Update timeInFirstPlace for the current snapshot
            timeInFirstPlaceMap[snapshotNumber] = Object.entries(firstPlaceStreaks)
                .map(([username, daysInFirst]) => ({ username, daysInFirst }))
                .sort((a, b) => b.daysInFirst - a.daysInFirst) // Sort by most days in first place
                .slice(0, 3); // Keep only the top 3 players

            // Update previous first-place player
            previousFirstPlace = firstPlacePlayer;
        }
      }
    });
    console.log(top10RankMap);
    console.log(timeInFirstPlaceMap);
  
    return { top10RankMap, top5WinRateMap, timeInFirstPlaceMap };
  };
  