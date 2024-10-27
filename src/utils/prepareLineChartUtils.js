export const createSeason7DataStruct = (allData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap) => {
    const usersWithSeason7 = [];
    // Loop through each user in the allData object
    Object.keys(allData).forEach(username => {
        // Check if the user has a 'Season 7' property and it contains data
        if (allData[username]['Season 7'] && allData[username]['Season 7'].length > 0 && playerReachesTop20(allData, username)) {
            usersWithSeason7.push(username);
        }
    });
  
    let playerRatingMap = {};
    for (let username of usersWithSeason7){
      playerRatingMap[username] = preparePlayerForLineChart(allData, username);
    }
    setPlayerRatingMap(playerRatingMap);
    setTopPlayersAtTimeMap(createTopPlayersAtTimeMap(allData, playerRatingMap, setMinMap, setMaxMap));
  }
  
  export const createTopPlayersAtTimeMap = (allData, playerRatingMapLocal, setMinMap, setMaxMap) => {
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
    createMinAndMaxMaps(playerRatingMapLocal, setMinMap, setMaxMap);
    return top20MapAllVisiblePlayersAtTime;
  }
  
  export const createMinAndMaxMaps = (playerRatingMapLocal, setMinMap, setMaxMap) => {
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
  
  
  export const playerReachesTop20 = (allData, player) => {
    return allData[player]['Season 7'].filter(p => p.playerRank <= 20).length > 0;
  }
  
  export const preparePlayerForLineChart = (allData, player) => {
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