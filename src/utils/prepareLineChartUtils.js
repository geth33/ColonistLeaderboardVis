export const generateTopPlayerLines = (allSeasonsData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, season, numOfPlayersOnChart, showEntering, showLeaving, startingSnapshot, numOfTicksOnGraph, seasonMaxSnapshotMap, seasonSnapshots) => {
    const playersOnGraph = [];
    // Loop through each user in the allSeasonsData object
    Object.keys(allSeasonsData).forEach(username => {
        if (allSeasonsData[username]['Season ' + season] && allSeasonsData[username]['Season ' + season].length > 0 && playerAppearsInGraph(allSeasonsData, username, season, numOfPlayersOnChart)) {
            playersOnGraph.push(username);
        }
    });
    
    let topPlayerMap = getTopPlayersPerSnapshot(allSeasonsData, startingSnapshot, season, numOfPlayersOnChart);
    let topPlayerMapJustUsernames = getUsernamesMap(topPlayerMap);
    let topPlayersAtTimeMap = createTopPlayersAtTimeMap(numOfTicksOnGraph, topPlayerMapJustUsernames);
    let bottomRatingsPerSnapshot = getBottomRatingsPerSnapshot(topPlayerMap, numOfPlayersOnChart); 
    let playerRatingMap = {};
    let maxSnapshot = seasonMaxSnapshotMap[season];
    for (let username of playersOnGraph){
      playerRatingMap[username] = preparePlayerForLineChart(allSeasonsData, username, season, numOfPlayersOnChart, startingSnapshot, maxSnapshot, bottomRatingsPerSnapshot, seasonSnapshots, showEntering, showLeaving);
    }
    setTopPlayersAtTimeMap(topPlayersAtTimeMap);
    setPlayerRatingMap(playerRatingMap);
    createMinAndMaxMaps(playerRatingMap, setMinMap, setMaxMap, numOfTicksOnGraph, playersOnGraph);
  }

  export const generateSeasonAverageLines = (allSeasonsData, seasonMaxSnapshotMap, seasonSnapshots, numOfPlayers, gameMode, numOfTicksOnGraph, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, startingSnapshot) => {
    let seasonLineMap = {};
    let seasonLineMapSubsnapshots = {};
    let topSeasonsAtTimeMap = {};
    let seasons = [7,8,9,10,11,12,13];
    for (let season of seasons){
      seasonLineMap["Season " + season] = generateSeasonAverageLine(allSeasonsData, season, seasonSnapshots, seasonMaxSnapshotMap, numOfPlayers, startingSnapshot, gameMode);
      seasonLineMapSubsnapshots["Season " + season] = generateSeasonAverageLineSubsnapshots(seasonLineMap["Season " + season]);
    }
    let sortedSeasons = sortSeasonsPerSnapshot(seasonLineMap, false);
    topSeasonsAtTimeMap = createTopPlayersAtTimeMap(numOfTicksOnGraph, sortedSeasons);
    setTopPlayersAtTimeMap(topSeasonsAtTimeMap);
    setPlayerRatingMap(seasonLineMapSubsnapshots);
    createMinAndMaxMaps(seasonLineMapSubsnapshots, setMinMap, setMaxMap, numOfTicksOnGraph);
  }

  export const sortSeasonsPerSnapshot = (seasonsMap, rollBackUpSubsnapshots) => {
    const result = {};

    // Find the highest values for each index
    const largestLength = Math.max(...Object.values(seasonsMap).map(arr => arr.length));
    // If the map is already in the subsnapshot form (values are spread out 25 times between snapshots), then we need to roll it back up into the normal snapshot values.
    let increment = rollBackUpSubsnapshots ? 25 : 1;
    const maxIndex = rollBackUpSubsnapshots ? largestLength + 1 : largestLength;
    for (let i = 0; i < maxIndex; i += increment) {
      // Collect all seasons and their values at index i
      let valuesAtIndex = Object.entries(seasonsMap)
        .map(([season, values]) => ({ season, value: values[i] || -Infinity })); // Use -Infinity if no value exists
      // Sort by value in descending order
      valuesAtIndex = valuesAtIndex.filter(v => v.value > 0); 
      valuesAtIndex.sort((a, b) => b.value - a.value);

      // Add the sorted season names to the result map
      result[i] = valuesAtIndex.map(({ season }) => season);
    }
    return result;
  }

  export const generateSeasonAverageLine = (allSeasonsData, season, seasonSnapshots, seasonMaxSnapshotMap, numOfPlayers, startingSnapshot, gameMode) => {
    let line = [];
    let snapshotsForSeason = [];
    if (season === 10 && numOfPlayers > 10 && gameMode === 'Base'){
      snapshotsForSeason = seasonSnapshots[season].filter(snapshot => snapshot < 170);
    } else {
      snapshotsForSeason = seasonSnapshots[season];
    }
    let topPlayersSnapshotMap = getTopPlayersPerSnapshot(allSeasonsData, startingSnapshot, season, numOfPlayers);
    for (let i=startingSnapshot; i <= seasonMaxSnapshotMap[season]; i++){
      if (snapshotsForSeason.includes(i)){
        let average = calculateAverageRatingForSnapshot(topPlayersSnapshotMap, i);
        line.push(average);
      } else {
        line.push(-1);
      }
    }
    return line;
  }

  export const generateSeasonAverageLineSubsnapshots = (line) => {
    let lineSubSnapshots = [];
    for (let i = 0; i < line.length - 1; i++) {
      let value = line[i];
      let nextValue = line[i+1];
      if (value == -1){
        for (let j = 0; j < 25; j++){
          lineSubSnapshots.push(-1);
        }
      } else if (nextValue == -1){
        for (let j = 0; j < 25; j++){
          lineSubSnapshots.push(value);
        }
      } else {
        let step = (nextValue - value)/25;
        for (let j = 0; j < 25; j++){
          lineSubSnapshots.push(value + step*j);
        }
      }
    }
    return smoothRatings(lineSubSnapshots, true);
  }

  const findFirstSnapshotWithData = (allSeasonsData, players) => {
    let allSeasons = [7,8,9,10,11,12,13];
    let usernamesInData = Object.keys(allSeasonsData);
    let firstSnapshotWithData = Infinity;

    for (let player of players){
      let usernameMatch = findMatchingUsername(usernamesInData, player.username);
      if (player.seasons[0] === 'All'){
        player.seasons = allSeasons;
      }
      for (let season of player.seasons){
        if (playerInSeason(allSeasonsData, usernameMatch, season)){
          let firstSnapshot = allSeasonsData[usernameMatch]["Season " + season][0].snapshotNumber;
          if (firstSnapshot < firstSnapshotWithData){
            firstSnapshotWithData = firstSnapshot;
          }
        }
      }
    }
    return firstSnapshotWithData;
  }

  const findPlayersWithoutData = (allSeasonsData, players) => {
    let allSeasons = [7,8,9,10,11,12,13];
    let usernamesInData = Object.keys(allSeasonsData);
    let playersWithoutData = [];

    for (let player of players){
      let playerHasAtLeastOneSeason = false;
      let usernameMatch = findMatchingUsername(usernamesInData, player.username);
      // Only check season data if there is a matching user. Otherwise, we default to saying this user has no data for the selected seasons.
      if (usernameMatch){
        if (player.seasons[0] === 'All'){
          player.seasons = allSeasons;
        }
        for (let season of player.seasons){
          if (!playerHasAtLeastOneSeason && playerInSeason(allSeasonsData, usernameMatch, season)){
            playerHasAtLeastOneSeason = true;
          }
        }
      }
      if (!playerHasAtLeastOneSeason){
        playersWithoutData.push(player.username);
      }
    }
    return playersWithoutData;
  }

  export const generateSelectedPlayerLines = (allSeasonsData, seasonMaxSnapshotMap, seasonSnapshots, numOfTicksOnGraph, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, settings, setStartingSnapshot) => {
    let playersWithoutData = findPlayersWithoutData(allSeasonsData, settings.players);
    if (playersWithoutData.length !== 0){
      return playersWithoutData;
    }

    let playerLineMap = {};
    let topPlayersAtTimeMap = {};
    let allSeasons = [7,8,9,10,11,12,13];
    let usernamesInData = Object.keys(allSeasonsData);
    // Update the starting snapshot to begin on the snapshot that has the first data. (we don't want an empty chart for 30 seconds)
    let updatedStartingSnapshot = Math.max(findFirstSnapshotWithData(allSeasonsData, settings.players) + 1, settings.startingSnapshot);
    setStartingSnapshot(updatedStartingSnapshot);

    for (let player of settings.players){
      let usernameMatch = findMatchingUsername(usernamesInData, player.username);
      if (player.seasons[0] === 'All'){
        player.seasons = allSeasons;
      }
      for (let season of player.seasons){
        let snapshotsToDisplay = Array.from({ length: (186-updatedStartingSnapshot) }, (_, i) => i + updatedStartingSnapshot);
        seasonSnapshots[season].forEach(value => {
            if (!snapshotsToDisplay.includes(value)) {
              snapshotsToDisplay.push(value);
            }
        });
        if (playerInSeason(allSeasonsData, usernameMatch, season)){
          playerLineMap[usernameMatch + " (S"+season+")"] = preparePlayerForLineChart(allSeasonsData, usernameMatch, season, 100000, updatedStartingSnapshot, seasonMaxSnapshotMap[season],null,snapshotsToDisplay.sort(),true,true);
        }
      }
    }
    let sortedPlayers = sortSeasonsPerSnapshot(playerLineMap, true);
    topPlayersAtTimeMap = createTopPlayersAtTimeMap(numOfTicksOnGraph, sortedPlayers);
    setTopPlayersAtTimeMap(topPlayersAtTimeMap);
    setPlayerRatingMap(playerLineMap);
    createMinAndMaxMaps(playerLineMap, setMinMap, setMaxMap, numOfTicksOnGraph);

    return [];
  }

  export const playersNotInDataset = (allSeasonsData, players) => {
    let playersNotInDataset = [];
    let playerUsernames = players.map(p => p.username);
    Object.keys(allSeasonsData).forEach(username => {
      if (playerUsernames.includes(username)){
        // One user can have multiple entries (one for each season)
        let matchingPlayers = players.filter(p => p.username == username);
        for (let player of matchingPlayers){
          if (!(allSeasonsData[player.username] && allSeasonsData[player.username]['Season ' + player.season] && allSeasonsData[player.username]['Season ' + player.season].length > 0)) {
            playersNotInDataset.push(player);
          }
        }
      }
    });
    return playersNotInDataset;
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
      let length = map[key].length;
      bottomRatings[key] = map[key][length-1].skillRating;
    });
    return bottomRatings;
  }

  /*
    Creates a map that stores the top players for each snapshot
    @param allSeasonsData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param startingSnapshot - The first snapshot the visualization will start on
    @param season - The season for this visualization.
    @param numOfPlayersOnChart - The number of players to display on the chart.
  */
  export const getTopPlayersPerSnapshot = (allSeasonsData, startingSnapshot, season, numOfPlayersOnChart) => {
    const topPlayerMap = {};
  
    // Iterate over each player in the original data
    Object.keys(allSeasonsData).forEach(username => {
      // Get the user's data for this season
      const currSeasonData = allSeasonsData[username]['Season ' + season];
    
      if (currSeasonData) {
        // For each entry in season, add it to the corresponding snapshot number
        currSeasonData.forEach(entry => {
          const { snapshotNumber, skillRating, playerRank } = entry;
    
          if (snapshotNumber >= startingSnapshot){
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

  export const calculateAverageRatingForSnapshot = (map, snapshot) => {
    let players = map[snapshot];
    return players.reduce((accumulator, player) => accumulator + player.skillRating, 0)/players.length;
  }

  const findFirstSnapshotWithUserData = (playerLines) => {
    let firstSubSnapshotWithValue = Infinity;
    for (let line of playerLines){
      for (let i = 0; i < line.length; i++){
        if (i < firstSubSnapshotWithValue && line[i] !== -1){
          firstSubSnapshotWithValue = i;
        }
      }
    }
    if (firstSubSnapshotWithValue === Infinity) console.log("Infinity error!");

    return firstSubSnapshotWithValue !== Infinity ? Math.floor(firstSubSnapshotWithValue/25) : 2;
  }
  
  /*

  */
  export const createTopPlayersAtTimeMap = (numOfTicksOnGraph, topPlayerMap) => {
    let topPlayerMapKeys = Object.keys(topPlayerMap).map(Number).sort((a, b) => a - b);

  for (let i = 0; i < topPlayerMapKeys.length-1; i++){
    let snapshotNumber = topPlayerMapKeys[i];
    topPlayerMap[snapshotNumber] = topPlayerMap[snapshotNumber].concat(topPlayerMap[topPlayerMapKeys[i+1]]);
  }
  
  let topPlayerMapSubSnapshots = {};
  let currSubsnapshot = 1;
  for (let i = 0; i < topPlayerMapKeys.length-1; i++){
      let diff = Math.min(topPlayerMapKeys[i+1] - topPlayerMapKeys[i],1);
      let jStart = currSubsnapshot 
      for (let j =jStart; j < jStart + (25*diff); j++){
        topPlayerMapSubSnapshots[j] = topPlayerMap[topPlayerMapKeys[i]];
        currSubsnapshot++;
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
  export const createMinAndMaxMaps = (playerRatingMap, setMinMap, setMaxMap, numOfTicksOnGraph, playersOnGraph) => {
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
      currMinMap[i] = minValue === Infinity ? currMinMap[i-1] : Math.floor(minValue); // If no valid min found, set as -1
      currMaxMap[i] = maxValue === -Infinity ? currMaxMap[i-1] : Math.ceil(maxValue); // If no valid max found, set as -1
    }

    // Add 5% white space buffer to top and bottom of graph.
    for (let i = 0; i < maxLength; i++) {
      let range = currMaxMap[i] - currMinMap[i];
      let buffer = Math.max(range * 0.01, 5);
      currMaxMap[i] += buffer;
      currMinMap[i] -= buffer;
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
        for (let j = i; j > i-numOfTicksOnGraph + 100; j--){
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
    let smoothedMinMap = smoothMinMaxMap(minMapSmooth); 
    let smoothedMaxMap = smoothMinMaxMap(maxMapSmooth);
    // Create a smoothing effect so that the min and max ranges aren't constantly ping ponging between different ranges.
    setMinMap(smoothedMinMap);
    setMaxMap(smoothedMaxMap);
  };

  export const adjustPlayerRatingtoMaxAndMinMaps = (ratings, smoothedMinMap, smoothedMaxMap) => {
    for (let i=0; i < ratings.length; i++){
      if (ratings[i] !== -1 && (ratings[i] < smoothedMinMap[i] || ratings[i] > smoothedMaxMap[i])){
        ratings[i] = -1;
      }
    }
    return ratings;
  }
  
  /*
    Returns true if the player appears at least once on the top rankings
    @param allSeasonsData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param username - The username of the player
    @param season - The season we're interested in
    @param numOfPlayersOnChart - The number of players we'll display on the chart. This is the lower bound for the rank they must hit to be on the graph
  */
  export const playerAppearsInGraph = (allSeasonsData, username, season, numOfPlayersOnChart) => {
    return allSeasonsData[username]['Season '+season].filter(p => p.playerRank <= numOfPlayersOnChart).length > 0;
  }
  
  /*
    Creates a number array that represents a player's ratings throughout the season.
    @param allSeasonsData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param username - The username of the player
    @param season - The season we're interested in
    @param numOfPlayersOnChart - The number of players we'll display on the chart. This is the lower bound for the rank they must hit to be on the graph
    @param startingSnapshot - The first snapshot the visualization will start on
    @param maxSnapshot - The final snapshot the visualization will end on
    @param bottomRatingsPerSnapshot - Map that contains the lowest y-axis rating for each snapshot. This is used to make sure lines aren't being drawn below this point.
    @param showEntering - Boolean on if we want to include data where the user enters the top ranks.
    @param showEntering - Boolean on if we want to include data where the user leaves the top ranks.
  */
  export const preparePlayerForLineChart = (allSeasonsData, username, season, numOfPlayersOnChart, startingSnapshot, maxSnapshot, bottomRatingsPerSnapshot, seasonSnapshots, showEntering, showLeaving) => {
    let ratings = [];
    let seasonData = allSeasonsData[username]['Season ' + season];
    seasonData = seasonData.filter(d => d.snapshotNumber >= startingSnapshot);
    let userInLastSnapshot = false;
    let snapshotCount = startingSnapshot;
    let prevSnapshotCount = startingSnapshot;
    for (let i = 0; i < seasonData.length; i++){
      if (seasonData[i].snapshotNumber >= startingSnapshot){
        while (snapshotCount != seasonData[i].snapshotNumber && snapshotCount < 186){
          if (seasonSnapshots.includes(snapshotCount)){
            for (let j = 0; j < 25; j++){
              ratings.push(-1);
            }
          }
          prevSnapshotCount = snapshotCount;
          snapshotCount += 1;
        }
        if (seasonData[i].snapshotNumber === maxSnapshot){
          userInLastSnapshot = true;
        }
        // If there is a large break between snapshots and the season does not have data between the two snapshots, we don't want this rising effect to occur.
        // Ex: season 10 has two instances of 15 days of missing data. So snapshot 30 may be right next to snapshot 61. We don't want all players at snapshot 61 to rise from 100 below.
        let largeBreakSincePrevSnapshot = seasonSnapshots.indexOf(snapshotCount - 1) === -1;
        
        let stepCount = maxSnapshot !== snapshotCount ? 25 : 12;
        // get bottom player at this point in the graph. We don't want this player's line to nose dive far past the bottom player's y position.
        let minValueAtPoint = 0;
        if (i !== seasonData.length - 1 && bottomRatingsPerSnapshot != null){
          minValueAtPoint = bottomRatingsPerSnapshot[seasonData[i+1].snapshotNumber] - 10;
        }
        let onGraph = seasonData[i].playerRank <= numOfPlayersOnChart;
        let noDataForPrevSnapshot = i == 0 || seasonData[i - 1]?.snapshotNumber != prevSnapshotCount; 
        if (onGraph && ((noDataForPrevSnapshot) && !largeBreakSincePrevSnapshot) && snapshotCount > startingSnapshot) {
          // Calculate the new rating values to replace the last 25 elements
          let rating1 = Math.max(seasonData[i].skillRating - 100, minValueAtPoint);
          let rating2 = seasonData[i].skillRating;
          let step = (rating2 - rating1) / stepCount;
          let newRatings = [];
        
          for (let j = 0; j < stepCount; j++) {
            newRatings.push(rating1 + step * j);
          }
        
          // Replace the last 25 elements of the ratings array
          if (ratings.length >= stepCount) {
            ratings.splice(ratings.length - stepCount, stepCount, ...newRatings);
          } else {
            // If there are less than 25 elements, replace what exists and add the rest
            ratings.splice(ratings.length - stepCount, stepCount, ...newRatings.slice(0, ratings.length));
            ratings.push(...newRatings.slice(ratings.length));
          }
        }
        if (i !== seasonData.length - 1){
          let enteringTop = showEntering && (seasonData[i].playerRank > numOfPlayersOnChart && seasonData[i+1].playerRank <= numOfPlayersOnChart);
          let leavingTop = showLeaving && (seasonData[i].playerRank <= numOfPlayersOnChart && seasonData[i+1].playerRank > numOfPlayersOnChart);
          // If the next piece of data is in the next snapshot, we want to interpolate between the two values
          if (snapshotCount + 1 >= seasonData[i+1].snapshotNumber && ((seasonData[i].playerRank <= numOfPlayersOnChart && seasonData[i+1].playerRank <= numOfPlayersOnChart) || enteringTop || leavingTop)){
            let rating1 = seasonData[i].skillRating;
            let rating2 = seasonData[i+1].skillRating;

            let step = (rating2 - rating1)/stepCount;
            for (let j = 0; j < stepCount; j++){
              let stepVal = rating1 + step * j;
              if (enteringTop){
                if (Math.abs(rating2 - stepVal) <= 50 && stepVal > minValueAtPoint){
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
                if (stepVal >= minValueAtPoint){
                  ratings.push(stepVal);
                } else {
                  ratings.push(-1);
                }
              }
            }
          } else { // Next snapshot of data isn't going to be graphed. We don't want to graph a single point, so we'll pretend this person wasn't in the top for this snapshot.
            for (let j = 0; j < stepCount; j++){
              ratings.push(-1);
            }
          }
        } else {
          if (seasonData[i].snapshotNumber !== maxSnapshot){
            ratings.push(-1);
          }
        }
        prevSnapshotCount = snapshotCount;
        snapshotCount += Math.min(1, seasonData[i+1]?.snapshotNumber - seasonData[i]?.snapshotNumber);
      }
    }
    return smoothRatings(ratings, userInLastSnapshot);
  }

  /*
    Creates maps that will be used by the leaderboards in the sidebar. Leaderboards track: top rating, top win rate, time in first.
    @param allSeasonsData - All data loaded from either the base or 1v1 csv. Contains info for all players for all seasons.
    @param season - The season we're interested in
    @param startingSnapshot - The first snapshot the visualization will start on
  */
  export const generateSnapshotMaps = (allSeasonsData, season, startingSnapshot) => {
    const top10RankMap = {};
    const top5WinRateMap = {};
    const timeInFirstPlaceMap = {};
    
    Object.keys(allSeasonsData).forEach(username => {
      const userSeasons = allSeasonsData[username];
  
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

  export const generateTopSeasonSnapshotMap = (allSeasonsData, numOfPlayers) => {
    const top10RankMap = {};
    const multiSeasonSnapshotMap = {};
    let uniqueSnapshots = new Set();
    let seasons = [7,8,9,10,11,12,13];

    Object.keys(allSeasonsData).forEach(username => {
      const userSeasons = allSeasonsData[username];
  
      for (let season of seasons){
          // Ensure the specified season exists for the user
        if (userSeasons["Season " + season]) {
          userSeasons["Season " + season].forEach(entry => {
            const { playerRank, snapshotNumber} = entry;
            uniqueSnapshots.add(snapshotNumber);
    
            // Initialize snapshot entry arrays if they don’t exist
            if (!multiSeasonSnapshotMap[season]){
              multiSeasonSnapshotMap[season] = {};
              multiSeasonSnapshotMap[season][snapshotNumber] = [];
            } else if (!multiSeasonSnapshotMap[season][snapshotNumber]){
              multiSeasonSnapshotMap[season][snapshotNumber] = [];
            }
    
            // Add to multiSeasonSnapshotMap if playerRank is between 1 and 10
            if (playerRank >= 1 && playerRank <= numOfPlayers) {
              multiSeasonSnapshotMap[season][snapshotNumber].push({ username, ...entry });
            }
          });
        }
        }
      });
      for (let snapshot of uniqueSnapshots){
        for (let season of seasons){
          if (multiSeasonSnapshotMap[season][snapshot]){
            let amountOfEntriesUnderSnapshot = multiSeasonSnapshotMap[season][snapshot].length;
            if (!top10RankMap[snapshot]){
              top10RankMap[snapshot] = [];
            }
            let avgWinRate = parseFloat(multiSeasonSnapshotMap[season][snapshot].reduce((accumulator, player) => accumulator + player.winRate, 0)/amountOfEntriesUnderSnapshot).toFixed(1);
            let avgRating = parseFloat(multiSeasonSnapshotMap[season][snapshot].reduce((accumulator, player) => accumulator + player.skillRating, 0)/amountOfEntriesUnderSnapshot).toFixed(0);
            top10RankMap[snapshot].push({
              username: "Season " + season,
              winRate: avgWinRate,
              skillRating: avgRating
            })
          }
        }
      }

      // Process and finalize each map to retain only the top players/countries as specified
    Object.keys(top10RankMap).forEach(snapshotNumber => {
      // Sort by playerRank and keep top 10, retaining full entry data
      top10RankMap[snapshotNumber] = top10RankMap[snapshotNumber]
        .sort((a, b) => b.skillRating - a.skillRating)
        .slice(0, 10); // Keep the full entries
    });

    return {top10RankMap}
  }

  const findMatchingUsername = (usernamesInData, username) => {
    return usernamesInData.find(
      (storedUsername) => storedUsername.toLowerCase() === username.toLowerCase()
    ) || null; // Return null if no match is found
  }

  export const generateSnapshotMapsForUsers = (allSeasonsData, seasonUserPairs, startingSnapshot) => {
    const top10RankMap = {};
    const top5WinRateMap = {};
    const timeInFirstPlaceMap = {};
    let allSeasons = [7,8,9,10,11,12,13];
    let usernamesInData = Object.keys(allSeasonsData);

    // Iterate over the provided user-season pairs
    seasonUserPairs.forEach(({ username, seasons }) => {
        let usernameMatch = findMatchingUsername(usernamesInData, username);
        const userSeasons = allSeasonsData[usernameMatch];

        // Ensure the user's data exists
        if (userSeasons) {
            let displayPlayerForMultipleSeasons = seasons.length > 1;
            if (seasons.length > 0 && seasons[0] === 'All'){
              seasons = allSeasons;
            }
            seasons.forEach(season => {
                const seasonKey = "Season " + season;

                // Ensure the specified season exists for the user
                if (userSeasons[seasonKey]) {
                    userSeasons[seasonKey].forEach(entry => {
                        const { snapshotNumber } = entry;

                        // Initialize snapshot entry arrays if they don’t exist
                        if (!top10RankMap[snapshotNumber]) top10RankMap[snapshotNumber] = [];
                        if (!top5WinRateMap[snapshotNumber]) top5WinRateMap[snapshotNumber] = [];
                        if (!timeInFirstPlaceMap[snapshotNumber]) timeInFirstPlaceMap[snapshotNumber] = {};
                        let usernameInMap = displayPlayerForMultipleSeasons ? usernameMatch + " (S"+season+")": usernameMatch;
                        top10RankMap[snapshotNumber].push({ username: usernameInMap, ...entry });

                        // Add to top5WinRateMap (consider all entries for win rate comparison)
                        top5WinRateMap[snapshotNumber].push({
                            username: usernameInMap,
                            ...entry,
                            winRate: parseFloat(entry.winRate.toFixed(1)),
                        });
                    });
                }
            });
        }
    });

    // Process and finalize each map to retain only the top players as specified
    Object.keys(top10RankMap).forEach(snapshotNumber => {
        // Sort by playerRank and keep top 10, retaining full entry data
        top10RankMap[snapshotNumber] = top10RankMap[snapshotNumber]
            .sort((a, b) => b.skillRating - a.skillRating)
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
        if (snapshotNumber >= startingSnapshot) {
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
                    if (firstPlaceStreaks[firstPlacePlayer]) {
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

const playerInSeason = (allSeasonsData, username, season) => {
  return allSeasonsData[username] && allSeasonsData[username]["Season " + season] !== undefined && allSeasonsData[username]["Season " + season] !== null;
}

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