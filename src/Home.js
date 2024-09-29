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

const updatedData = {
  Alice: { rating: 1550, winRate: 55, country: 'USA' },
  Bill: { rating: 1530, winRate: 32, country: 'UK' },
  Julia: { rating: 1510, winRate: 32, country: 'UK' },
  Alfredo: { rating: 1510, winRate: 32, country: 'UK' },
  Bob: { rating: 1480, winRate: 60, country: 'Canada' },
  Paul: { rating: 1470, winRate: 44, country: 'UK' },
  Charlie: { rating: 1450, winRate: 58, country: 'UK' },
  Hannah: { rating: 1420, winRate: 62, country: 'USA' },
  Eva: { rating: 1400, winRate: 52, country: 'UK' },
  Quinn: { rating: 1399, winRate: 63, country: 'UK' },
};

const Home = () => {
  const [data, setData] = useState(initialData);


  useEffect(() => {
    // Simulate data update
    setTimeout(() => {
      setData(updatedData);
    }, 2000); // Update data after 5 seconds
  }, []);


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
