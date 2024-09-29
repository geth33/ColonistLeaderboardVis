import React, { useState, useEffect } from 'react';
import LeaderBoard from './LeaderBoard';
import LineChart from './LineChart';
import constants from './constants';

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
        <LineChart />
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
