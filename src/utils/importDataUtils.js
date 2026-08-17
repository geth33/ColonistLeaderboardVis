import Papa from 'papaparse';

export const readDataFromFile = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url) // Now fetching the file from the CDN URL
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
    let currentSnapshotPlayers = new Set();
    let seasonMaxSnapshotMap = {};
    let seasonSnapshotsMap = { 6: [] };
    let seasonFinalRankingMap = { 6: [] };
  
    data.forEach((entry) => {
        const skillRating = parseFloat(entry.skillRating);
        let createdAt = null;

        if (entry.created_at) {
            createdAt = new Date(entry.created_at);

            if (entry.playerRank === '1') {
                if (lastTopPlayerRating !== null && lastTopPlayerRating - skillRating > 300) {
                    seasonMaxSnapshotMap[currentSeason] = snapshotNumber;
                    currentSeason++;
                    seasonSnapshotsMap[currentSeason] = [1];
                    seasonFinalRankingMap[currentSeason] = [];
                    snapshotNumber = 1;
                    previousCreatedAt = null;
                }
                lastTopPlayerRating = skillRating;
            }

            if (previousCreatedAt && calculateHoursBetweenDates(previousCreatedAt, createdAt) > 1) {
                snapshotNumber += incrementSnapshotNumber(previousCreatedAt, createdAt, currentSeason);
                seasonSnapshotsMap[currentSeason].push(snapshotNumber);
                currentSnapshotPlayers.clear();
            }
            previousCreatedAt = createdAt;

            const username = entry.username;
            if (!processedData[username]) processedData[username] = {};
            if (!processedData[username][`Season ${currentSeason}`]) {
                processedData[username][`Season ${currentSeason}`] = [];
            }

            if (!currentSnapshotPlayers.has(username)) {
                processedData[username][`Season ${currentSeason}`].push({
                    countryCode: entry.countryCode,
                    division: parseInt(entry.division, 10),
                    playerRank: parseInt(entry.playerRank, 10),
                    skillRating,
                    totalGamesPlayed: parseInt(entry.totalGamesPlayed, 10),
                    winRate: parseFloat(entry.winRate),
                    snapshotNumber,
                    createdAt: entry.created_at,
                    flagURL: getTwemojiFlagURL(entry.countryCode)
                });

                if (entry.finalSnapshot === "1") {
                    seasonFinalRankingMap[currentSeason].push(entry);
                }

                currentSnapshotPlayers.add(username);
            }
        } else {
            seasonMaxSnapshotMap[currentSeason] = snapshotNumber;
        }
    });

    return {
        fileData: processedData,
        fileMaxSnapshotMap: seasonMaxSnapshotMap,
        fileSeasonsSnapshotsMap: seasonSnapshotsMap,
        fileSeasonFinalRankingMap: seasonFinalRankingMap
    };
};

  const incrementSnapshotNumber = (previousCreatedAt, createdAt, currentSeason) => {
    let hoursDifference = calculateHoursBetweenDates(previousCreatedAt, createdAt);
    return Math.max(1, hoursDifference/12);
  }

  export const getTwemojiFlagURL = (countryCode) => {
    const baseUrl = "https://cdn.jsdelivr.net/npm/twemoji@11.0.1/2/svg/";
    
    if (!countryCode || countryCode.length !== 2) return null;

    // Convert the country code to uppercase (e.g., "us" -> "US")
    countryCode = countryCode.toUpperCase();

    // Convert letters to Twemoji Unicode sequence (regional indicators)
    const codePoints = [...countryCode].map(char => 
        `1f1${(char.charCodeAt(0) - 65 + 0xe6).toString(16)}`
    );

    return `${baseUrl}${codePoints.join('-')}.svg`;
}

  function calculateHoursBetweenDates(startDate, endDate) {
    let diffInMilliseconds = endDate.getTime() - startDate.getTime();
    let diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    if (diffInHours == 11 || diffInHours == 13){
        diffInHours = 12;
    }
    return diffInHours;
  }