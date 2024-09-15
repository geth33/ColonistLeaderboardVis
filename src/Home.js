import React from 'react';
import LeaderBoard from './LeaderBoard';
import LineChart from './LineChart';
import constants from './constants';


const Home = () => {
  return (
    <div className='visContainer'>
        <LineChart />
        <div className='supportingVisContainer'>
            <div className='leaderboardItem leaderboardItem1'>
            <LeaderBoard title="Top Rating" data={constants.ratingData} leaderBoardMetric="rating" />
            </div>

            <div className='leaderboardItem leaderboardItem2'>
            <LeaderBoard title="Top Win Rate" data={constants.winRateData} leaderBoardMetric="winRate" />
            </div>

            <div className='leaderboardItem leaderboardItem3'>
            <LeaderBoard title="Top Countries" data={constants.countryData} leaderBoardMetric="countryNumber" />
            </div>
        </div>
    </div>
  );
};

export default Home;
