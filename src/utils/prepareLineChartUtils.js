export const createSeasonDataStruct = (allData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, season, numOfPlayersOnChart, showEntering, showLeaving, startingSnapshot, numOfTicksOnGraph, seasonMaxSnapshotMap) => {
    const playersOnGraph = [];
    // Loop through each user in the allData object
    Object.keys(allData).forEach(username => {
        if (allData[username]['Season ' + season] && allData[username]['Season ' + season].length > 0 && playerAppearsInGraph(allData, username, season, numOfPlayersOnChart)) {
            playersOnGraph.push(username);
        }
    });
    
    let topPlayerMap = getTopPlayersPerSnapshot(allData, startingSnapshot, season, numOfPlayersOnChart);
    let topPlayerMapJustUsernames = getUsernamesMap(topPlayerMap);
    let topPlayersAtTimeMap = createTopPlayersAtTimeMap(numOfTicksOnGraph, topPlayerMapJustUsernames);
    let bottomRatingsPerSnapshot = getBottomRatingsPerSnapshot(topPlayerMap, numOfPlayersOnChart); 
    let playerRatingMap = {};
    let maxSnapshot = seasonMaxSnapshotMap[season];
    for (let username of playersOnGraph){
      playerRatingMap[username] = preparePlayerForLineChart(allData, username, season, numOfPlayersOnChart, startingSnapshot, maxSnapshot, bottomRatingsPerSnapshot, showEntering, showLeaving);
    }
    setTopPlayersAtTimeMap(topPlayersAtTimeMap);
    setPlayerRatingMap(playerRatingMap);
    createMinAndMaxMaps(playerRatingMap, setMinMap, setMaxMap, numOfTicksOnGraph);
  }

  /*
    Returns map should with only usernames (get rid of playerRank and skillRating info)
    @param map - the map
  */
  export const getUsernamesMap = (map) => {
    let mapJustUsernames = {};
    let keys = Object.keys(map).map(Number).sort((a, b) => a - b);
    keys.forEach(key => {
      mapJustUsernames[key] = map[key].map(player => player.username);
    });
    return mapJustUsernames;
  }

  /*
    Returns a map that has the rating for the lowest ranked player in the visualization for each snapshot
    @param map - Map that contains the player data (username, skillRating, playerRank) for each snapshot
  */
  export const getBottomRatingsPerSnapshot = (map, numOfPlayersOnChart) => {
    let bottomRatings = {};
    let keys = Object.keys(map).map(Number).sort((a, b) => a - b);
    keys.forEach(key => {
      bottomRatings[key] = map[key][numOfPlayersOnChart-1].skillRating
    });
    return bottomRatings;
  }

  /*
    Creates a map that stores the top players for each snapshot
    @param allData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param startingSnapshot - The first snapshot the visualization will start on
    @param season - The season for this visualization.
    @param numOfPlayersOnChart - The number of players to display on the chart.
  */
  export const getTopPlayersPerSnapshot = (allData, startingSnapshot, season, numOfPlayersOnChart) => {
    const topPlayerMap = {};
  
    // Iterate over each player in the original data
    Object.keys(allData).forEach(username => {
      // Get the user's data for this season
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
            topPlayerMap[snapshotNumber].push({username, playerRank, skillRating});
          }
        });
      }
    });
    return truncateMap(topPlayerMap, numOfPlayersOnChart);
  }

  /*
    Sorts a map by the playerRank and then truncates it.
    @param map - map to truncate
    @param amountToTruncate - amount to truncate from map
  */
  export const truncateMap = (map, amountToTruncate) => {
    let keys = Object.keys(map).map(Number).sort((a, b) => a - b);
    // Now, sort and trim each snapshot array to retain only the top players by rating
    keys.forEach(key => {
      map[key] = map[key]
        .sort((a, b) => a.playerRank - b.playerRank) // Sort by skillRating descending
        .slice(0, amountToTruncate); // Convert to usernames only
    });
    return map;
  }
  
  /*

  */
  export const createTopPlayersAtTimeMap = (numOfTicksOnGraph, topPlayerMap) => {
    let topPlayerMapKeys = Object.keys(topPlayerMap).map(Number).sort((a, b) => a - b);

  let lastSnapshot = topPlayerMapKeys[topPlayerMapKeys.length-1];
  topPlayerMapKeys.forEach(snapshotNumber => {
    if (snapshotNumber != lastSnapshot){
      topPlayerMap[snapshotNumber] = topPlayerMap[snapshotNumber].concat(topPlayerMap[snapshotNumber+1]);
    }
  });
  
  let topPlayerMapSubSnapshots = {};
  let currSubsnapshot = 1;
  let largestKey = topPlayerMapKeys[topPlayerMapKeys.length-1];
  for (let i of topPlayerMapKeys){
    if (i != largestKey){
      let jStart = currSubsnapshot 
      for (let j =jStart; j < jStart + 25; j++){
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
    return topPlayerMapAllVisiblePlayersAtTime;
  }
  
  /*
    Creates the maps that will controls the y-axis range. 
    @param playerRatingMap - The map that contains all of the playerRating arrays for users that will be displayed on the map
    @param setMinMap - Setter for the min map 
    @param setMinMap - Setter for the min map 
    @param numOfTicksOnGraph - This is corresponding to the x-axis domain size. This is the max number of ratings that will be displayed of a user's playerRating array at one time.
  */
  export const createMinAndMaxMaps = (playerRatingMap, setMinMap, setMaxMap, numOfTicksOnGraph) => {
    // First, find the min and max ratings for each time (tick) on the graph.
    const currMinMap = {};
    const currMaxMap = {};
  
    // Determine the length of the longest array in playerRatingMap
    const maxLength = Math.max(...Object.values(playerRatingMap).map(arr => arr.length));
  
    // Iterate through each index position (0 to maxLength - 1)
    for (let i = 0; i < maxLength; i++) {
      let minValue = Infinity;
      let maxValue = -Infinity;
  
      // Go through each player's ratings array at the index `i`
      Object.values(playerRatingMap).forEach(ratings => {
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
  
    // Now we'd like to create min and max maps that account for all data points displayed on the graph.
    let minMapSmooth = {};
    let maxMapSmooth = {};
  
    for (let i = 1; i <= maxLength-1; i++) {
  
      let minRating = Infinity;
      let maxRating = -Infinity;
      // Chart hasn't begun moving yet, min/max values for the data points that have appeared so far.
      if (i <= numOfTicksOnGraph){
        for (let j = i; j > 0; j--){
          if (currMinMap[j] < minRating){
            minRating = currMinMap[j];
          }
          if (currMaxMap[j] > maxRating){
            maxRating = currMaxMap[j];
          }
        }
      } else { // Find min and max values for the smallest/largest ratings for the last numOfTicksOnGraph (x axis window) ratings. 
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
    // Create a smoothing effect so that the min and max ranges aren't constantly ping ponging between different ranges.
    setMinMap(smoothMinMaxMap(minMapSmooth));
    setMaxMap(smoothMinMaxMap(maxMapSmooth));
  };
  
  /*
    Returns true if the player appears at least once on the top rankings
    @param allData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param username - The username of the player
    @param season - The season we're interested in
    @param numOfPlayersOnChart - The number of players we'll display on the chart. This is the lower bound for the rank they must hit to be on the graph
  */
  export const playerAppearsInGraph = (allData, username, season, numOfPlayersOnChart) => {
    return allData[username]['Season '+season].filter(p => p.playerRank <= numOfPlayersOnChart).length > 0;
  }
  
  /*
    Creates a number array that represents a player's ratings throughout the season.
    @param allData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param username - The username of the player
    @param season - The season we're interested in
    @param numOfPlayersOnChart - The number of players we'll display on the chart. This is the lower bound for the rank they must hit to be on the graph
    @param startingSnapshot - The first snapshot the visualization will start on
    @param maxSnapshot - The final snapshot the visualization will end on
    @param bottomRatingsPerSnapshot - Map that contains the lowest y-axis rating for each snapshot. This is used to make sure lines aren't being drawn below this point.
    @param showEntering - Boolean on if we want to include data where the user enters the top ranks.
    @param showEntering - Boolean on if we want to include data where the user leaves the top ranks.
  */
  export const preparePlayerForLineChart = (allData, username, season, numOfPlayersOnChart, startingSnapshot, maxSnapshot, bottomRatingsPerSnapshot, showEntering, showLeaving) => {
    let ratings = [];
    let seasonData = allData[username]['Season ' + season];
    seasonData = seasonData.filter(d => d.snapshotNumber > startingSnapshot-1);
    let userInLastSnapshot = false;
    let snapshotCount = startingSnapshot;
    for (let i = 0; i < seasonData.length; i++){
      if (seasonData[i].snapshotNumber > startingSnapshot-1){
        while (snapshotCount != seasonData[i].snapshotNumber && snapshotCount < 185){
          for (let j = 0; j < 25; j++){
            ratings.push(-1);
          }
          snapshotCount++;
        }
        if (seasonData[i].snapshotNumber === maxSnapshot){
          userInLastSnapshot = true;
        }
        if (seasonData[i].playerRank <= numOfPlayersOnChart && (i == 0 || seasonData[i - 1].snapshotNumber != snapshotCount - 1) && snapshotCount > startingSnapshot) {
          // Calculate the new rating values to replace the last 30 elements
          let rating1 = seasonData[i].skillRating - 100;
          let rating2 = seasonData[i].skillRating;
          let step = (rating2 - rating1) / 25;
          let newRatings = [];
        
          for (let j = 0; j < 25; j++) {
            newRatings.push(rating1 + step * j);
          }
        
          // Replace the last 25 elements of the ratings array
          if (ratings.length >= 25) {
            ratings.splice(ratings.length - 25, 25, ...newRatings);
          } else {
            // If there are less than 25 elements, replace what exists and add the rest
            ratings.splice(ratings.length - 25, 25, ...newRatings.slice(0, ratings.length));
            ratings.push(...newRatings.slice(ratings.length));
          }
        }
        if (i !== seasonData.length - 1){
          let enteringTop = showEntering && (seasonData[i].playerRank > numOfPlayersOnChart && seasonData[i+1].playerRank <= numOfPlayersOnChart);
          let leavingTop = showLeaving && (seasonData[i].playerRank <= numOfPlayersOnChart && seasonData[i+1].playerRank > numOfPlayersOnChart);

          // If the next piece of data is in the next snapshot, we want to interpolate between the two values
          if (snapshotCount + 1 == seasonData[i+1].snapshotNumber && ((seasonData[i].playerRank <= numOfPlayersOnChart && seasonData[i+1].playerRank <= numOfPlayersOnChart) || enteringTop || leavingTop)){
            let rating1 = seasonData[i].skillRating;
            let rating2 = seasonData[i+1].skillRating;
            let step = (rating2 - rating1)/25;
            // get bottom player at this point in the graph. We don't want this player's line to nose dive far past the bottom player's y position.
            let minValueAtPoint = bottomRatingsPerSnapshot[seasonData[i+1].snapshotNumber] - 50;
            for (let j = 0; j < 25; j++){
              let stepVal = rating1 + step * j;
              if (enteringTop){
                if (Math.abs(rating2 - stepVal) <= 50){
                  ratings.push(stepVal);
                } else {
                  ratings.push(-1);
                }
              } else if (leavingTop) {
                if (stepVal >= minValueAtPoint){
                  ratings.push(stepVal);
                } else {
                  ratings.push(-1);
                }
              }else {
                ratings.push(stepVal);
              }
            }
          } else { // Next snapshot of data isn't going to be graphed. We don't want to graph a single point, so we'll pretend this person wasn't in the top for this snapshot.
            for (let j = 0; j < 25; j++){
              ratings.push(-1);
            }
          }
        } else {
          if (seasonData[i].snapshotNumber !== maxSnapshot){
            ratings.push(-1);
          }
        }
        snapshotCount++;
      }
    }
    return smoothRatings(ratings, userInLastSnapshot);
  }

  /*
    Creates maps that will be used by the leaderboards in the sidebar. Leaderboards track: top rating, top win rate, time in first.
    @param allData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param season - The season we're interested in
    @param startingSnapshot - The first snapshot the visualization will start on
  */
  export const generateSnapshotMaps = (allData, season, startingSnapshot) => {
    const top10RankMap = {};
    const top5WinRateMap = {};
    const timeInFirstPlaceMap = {};
  
    Object.keys(allData).forEach(username => {
      const userSeasons = allData[username];
  
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
  
    return { top10RankMap, top5WinRateMap, timeInFirstPlaceMap };
  };

  /*
    Smooths the map so that there aren't sudden jerks to a new minimum/maximum for the graph
    @param map - The map that needs to be smoothed. Either a min or max map.
  */
  export function smoothMinMaxMap(map, windowSize = 10) {
    const smoothedData = {};
    const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
  
    for (let i = 0; i < keys.length; i++) {
      let start = Math.max(0, i - Math.floor(windowSize / 2));
      let end = Math.min(keys.length, i + Math.floor(windowSize / 2) + 1);
      let windowKeys = keys.slice(start, end);
      
      // Calculate the average of the values within the window
      let average = windowKeys.reduce((sum, key) => sum + map[key], 0) / windowKeys.length;
      smoothedData[keys[i]] = average;
    }
  
    return smoothedData;
  }
  
  /*
    Adds a smoothing effect to the ratings line for the user
    @param ratings - The ratings for the user over time in the visualization. Includes subintervals.
    @param userInLastSnapshot - Boolean saying whether this user is still an active player on the map when the visualization concludes
  */
    function smoothRatings(ratings, userInLastSnapshot, windowSize = 5) {
      const smoothedData = [...ratings]; // Create a copy of the input data
      const halfWindow = Math.floor(windowSize / 2);
      // Don't want the chart to smooth the final stretch as it will make rankings look visually incorrect
      let loopSize = userInLastSnapshot ? ratings.length - 25 : ratings.length;
  
      for (let i = 0; i < loopSize; i++) {
          // Determine the range for smoothing
          let start = Math.max(0, i - halfWindow);
          let end = Math.min(ratings.length - 1, i + halfWindow);
  
          // Collect values within the window, skipping if any value is -1
          let sum = 0;
          let count = 0;
          let skipSmoothing = false;
  
          for (let j = start; j <= end; j++) {
              if (ratings[j] === -1) {
                  skipSmoothing = true;
                  break;
              }
              sum += ratings[j];
              count++;
          }
  
          // Apply smoothing if no -1 values were in the window
          if (!skipSmoothing && count > 0) {
              smoothedData[i] = sum / count;
          }
      }
  
      return smoothedData;
  }