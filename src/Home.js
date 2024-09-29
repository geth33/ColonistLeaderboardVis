import React, { useState, useEffect, useRef } from 'react';
import LeaderBoard from './LeaderBoard';
import LineChart from './LineChart';
import constants from './constants';

const initialData = {
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

const Home = () => {
  const [data, setData] = useState(initialData);

  // Function to randomly add or subtract 10 from each user's rating
  const updateRatings = () => {
    const updatedData = { ...data };
    Object.keys(updatedData).forEach((key) => {
      const change = Math.random() < 0.5 ? -10 : 10;
      updatedData[key].rating = updatedData[key].rating + change;
    });
    return updatedData;
  };

  const addNewUser = (currentData, attempt = 0) => {
    const newUserNames = ['Alfredo', 'Maggie', 'Oliver', 'Nina', 'Zack', 'Sophia', 'Phil', 'Andreas', 'Tyrone', 'Gloria', 'Jesus'];
    const maxAttempts = newUserNames.length; // Prevent infinite recursion
  
    // Exit condition: If we've tried all names and still can't add, exit
    if (attempt >= maxAttempts) {
      console.warn("Max attempts reached. No new user added.");
      return currentData;
    }
  
    const randomName = newUserNames[Math.floor(Math.random() * newUserNames.length)];
  
    // Check if there are 10 players already
    if (Object.keys(currentData).length >= 10) {
      // Find the player with the lowest rating
      const lowestRatedPlayer = Object.keys(currentData).reduce((lowest, player) => {
        return currentData[player].rating < currentData[lowest].rating ? player : lowest;
      }, Object.keys(currentData)[0]);
  
      // Remove the lowest-rated player, ensuring we add the new one
      delete currentData[lowestRatedPlayer];
    }
  
    // Add the new player, but only if they don't already exist
    if (!(randomName in currentData)) {
      currentData[randomName] = {
        rating: 1500 + Math.floor(Math.random() * 100),
        winRate: 50,
        country: 'Unknown',
      };
    } else {
      // If the random user is already in the data, retry (recursive call)
      return addNewUser(currentData, attempt + 1);
    }
  
    return currentData;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      let updatedData = updateRatings();

      // Occasionally (e.g., 1 in 5 times), add a new user
      if (Math.random() < 0.2) {
        updatedData = addNewUser(updatedData);
      }

      // Ensure the data always has 10 players
      if (Object.keys(updatedData).length < 10) {
        updatedData = addNewUser(updatedData);
      }

      setData({ ...updatedData });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval); // Clear the interval on unmount
  }, [data]);

  return (
    <div className='visContainer'>
        <LineChart />
        <div className='supportingVisContainer'>
            <div className='leaderboardItem leaderboardItem1'>
            <LeaderBoard title="Top Rating" data={data} leaderBoardMetric="rating" size={10}/>
            </div>

            {/* <div className='leaderboardItem leaderboardItem2'>
            <LeaderBoard title="Top Win Rate" data={constants.winRateData} leaderBoardMetric="winRate" size={5}/>
            </div>

            <div className='leaderboardItem leaderboardItem3'>
            <LeaderBoard title="Top Countries" data={constants.countryData} leaderBoardMetric="countryNumber" size={5}/>
            </div> */}
        </div>
    </div>
  );
};

export default Home;
