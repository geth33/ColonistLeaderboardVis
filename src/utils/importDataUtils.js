import Papa from 'papaparse';

export const readDataFromFile = (csvFileName, setAllData, setSeasonMaxSnapshotMap) => {
    fetch(csvFileName) // Assuming the file is in the 'public' directory
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                    setAllData(processPlayerData(results.data, setSeasonMaxSnapshotMap));
                },
                error: (error) => {
                    console.error("Error reading CSV file:", error);
                }
            });
        })
        .catch(error => console.error("Error fetching CSV file:", error));
};

const processPlayerData = (data, setSeasonMaxSnapshotMap) => {
    let processedData = {};
    let currentSeason = 6;
    let lastTopPlayerRating = null;
    let snapshotNumber = 1;
    let previousCreatedAt = null;
    let currentSnapshotPlayers = [];
    let seasonMaxSnapshotMap = {};
  
    data.forEach((entry, index) => {
        // Parse the relevant numeric fields
        const skillRating = parseFloat(entry.skillRating);
        let createdAt = null;
        if (entry.created_at){
            const [month, day, year, hour] = entry.created_at.match(/\d+/g); // Extracts parts as numbers
            createdAt = new Date(year, month - 1, day, hour); // "1/6/2024 19:02" will be parsed as a Date
        
        
        // Determine if a new season has started
        if (entry.playerRank === '1') {
            if (lastTopPlayerRating !== null && lastTopPlayerRating - skillRating > 300) {
                seasonMaxSnapshotMap[currentSeason] = snapshotNumber;
                currentSeason++; // New season detected
                snapshotNumber = 1; // Reset snapshot count
                previousCreatedAt = null;
            }
            lastTopPlayerRating = skillRating; // Update the top player rating
        }
  
        // Check if it's a new snapshot
        if (previousCreatedAt && previousCreatedAt.getTime() !== createdAt.getTime()) {
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
    } else {
        seasonMaxSnapshotMap[currentSeason] = snapshotNumber;
    }
    });
    setSeasonMaxSnapshotMap(seasonMaxSnapshotMap);
    console.log("Processed Data:", processedData);
    return processedData;
  };