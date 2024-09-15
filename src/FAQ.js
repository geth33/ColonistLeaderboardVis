// src/FAQ.js
import React from 'react';

const FAQ = () => {
  return (
    <div className='faq'>
      <h1>Frequently Asked Questions</h1>
      <div>
        <h2>What is this application about?</h2>
        <p>This application displays a dynamic line chart and leaderboards for various metrics.</p>
        
        <h2>How can I use the leaderboards?</h2>
        <p>The leaderboards show the top players based on different metrics such as rating and win rate.</p>
        
        {/* Add more FAQ content here */}
      </div>
    </div>
  );
};

export default FAQ;
