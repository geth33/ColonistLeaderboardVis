import Papa from 'papaparse';

export const readDataFromFile = (csvFileName) => {
    return new Promise((resolve, reject) => {
      fetch(csvFileName) // Assuming the file is in the 'public' directory
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              try {
                const processedData = processPlayerData(results.data);
                resolve(processedData); // Resolve the Promise with the processed data
              } catch (error) {
                reject(error); // Reject the Promise if there's an error in processing
              }
            },
            error: (error) => {
              reject(`Error parsing CSV file: ${error}`);
            },
          });
        })
        .catch((error) => reject(`Error fetching CSV file: ${error}`));
    });
  };

const processPlayerData = (data) => {
    let processedData = {};
    let currentSeason = 6;
    let lastTopPlayerRating = null;
    let snapshotNumber = 1;
    let previousCreatedAt = null;
    let currentSnapshotPlayers = [];
    let seasonMaxSnapshotMap = {};
    let seasonSnapshotsMap = { 6: []};
  
    data.forEach((entry, index) => {
        // Parse the relevant numeric fields
        const skillRating = parseFloat(entry.skillRating);
        let createdAt = null;
        if (entry.created_at){
            const [month, day, year, hour] = entry.created_at.match(/\d+/g); // Extracts parts as numbers
            createdAt = new Date(year, month-1, day, hour);
            // if (currentSeason == 7){
            //     console.log(entry.created_at);
            //     console.log(month-1);
            //     console.log(day);
            //     console.log(year);
            //     console.log(hour);
            //     console.log(createdAt);
            // }
        // Determine if a new season has started
        if (entry.playerRank === '1') {
            if (lastTopPlayerRating !== null && lastTopPlayerRating - skillRating > 300) {
                seasonMaxSnapshotMap[currentSeason] = snapshotNumber;
                currentSeason++; // New season detected
                seasonSnapshotsMap[currentSeason] = [1];
                snapshotNumber = 1; // Reset snapshot count
                previousCreatedAt = null;
            }
            lastTopPlayerRating = skillRating; // Update the top player rating
        }
  
        // Check if it's a new snapshot
        if (previousCreatedAt && previousCreatedAt.getTime() !== createdAt.getTime()) {
            snapshotNumber += incrementSnapshotNumber(previousCreatedAt, createdAt,currentSeason);
            seasonSnapshotsMap[currentSeason].push(snapshotNumber);
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
    } else {
        seasonMaxSnapshotMap[currentSeason] = snapshotNumber;
    }
    });
    console.log("Processed Data:", processedData);
    return {
        fileData: processedData,
        fileMaxSnapshotMap: seasonMaxSnapshotMap,
        fileSeasonsSnapshotsMap: seasonSnapshotsMap
    };
  };

  const incrementSnapshotNumber = (previousCreatedAt, createdAt, currentSeason) => {
    let hoursDifference = calculateHoursBetweenDates(previousCreatedAt, createdAt);
    // if (currentSeason == 7){
    //     console.log(previousCreatedAt);
    //     console.log(createdAt);
    //     console.log(hoursDifference);
    // }
    return Math.max(1, hoursDifference/12);
  }

  function calculateHoursBetweenDates(startDate, endDate) {
    let diffInMilliseconds = endDate.getTime() - startDate.getTime();
    let diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    if (diffInHours == 11 || diffInHours == 13){
        diffInHours = 12;
    }
    return diffInHours;
  }