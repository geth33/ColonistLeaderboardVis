import React from 'react';
import './App.css';
import LeaderBoard from './LeaderBoard';
import LineChart from './LineChart';  // Import the new LineChart component
import constants from "./constants";

function App() {
  return (
    <div className='App'>
      <div className='visContainer'>
        <LineChart />  {/* Use the LineChart component here */}
        <div className='supportingVisContainer'>
          <LeaderBoard title="Top Rating" data={constants.ratingData} leaderBoardMetric="rating" />
          <LeaderBoard title="Top Win Rate" data={constants.winRateData} leaderBoardMetric="winRate" />
          <LeaderBoard title="Top Countries" data={constants.countryData} leaderBoardMetric="countryNumber" />
        </div>
      </div>
    </div>
  );
}

export default App;
