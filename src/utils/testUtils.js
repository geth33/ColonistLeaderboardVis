// Function to randomly add or subtract 10 from each user's rating
export const updatePlayerRatings = (playerData) => {
    const updatedData = { ...playerData };
    Object.keys(updatedData).forEach((key) => {
      const change = Math.random() < 0.5 ? -10 : 10;
      updatedData[key].rating = updatedData[key].rating + change;
    });
    return updatedData;
  };

  // Function to add or subtract 2 from each country's countryNumber
export const updateCountryNumbers = (countryData) => {
    const updatedCountryData = { ...countryData };
    Object.keys(updatedCountryData).forEach((country) => {
      const change = Math.random() < 0.5 ? -2 : 2;
      updatedCountryData[country].countryNumber = updatedCountryData[country].countryNumber + change;
    });
    return updatedCountryData;
  };

  // Function to add or subtract 2 from each user's winRate
export const updateWinRates = (winRateData) => {
    const updatedWinRateData = { ...winRateData };
    Object.keys(updatedWinRateData).forEach((key) => {
      const change = Math.random() < 0.5 ? -2 : 2;
      updatedWinRateData[key].winRate = updatedWinRateData[key].winRate + change;
    });
    return updatedWinRateData;
  };

export const addNewPlayer = (currentData, attempt = 0) => {
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

export const addNewCountry = (currentCountryData) => {
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

  export const addNewWinRatePlayer = (currentWinRateData) => {
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