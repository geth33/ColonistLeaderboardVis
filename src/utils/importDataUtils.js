import Papa from 'papaparse';

export const read1v1DataFromFile = (setAllData) => {
    fetch('/colonist_1v1_9_14_2024.csv') // Assuming the file is in the 'public' directory
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                    setAllData(processPlayerData(results.data));
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
    console.log("Processed Data:", processedData);
    return processedData;
  };