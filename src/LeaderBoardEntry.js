import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import './LeaderBoardEntry.css'; // Import CSS for styling

const LeaderBoardEntry = ({ rank, name, value }) => {
  const entryRef = useRef(null); // Reference to the DOM element

  // Animate the background color change based on rank
  useEffect(() => {
    let targetColor = '';
    let targetFontSize = '12px';

    if (rank === 1) {
      targetColor = '#ffd700'; // Gold
      targetFontSize = '16px'; // Largest for first place
    } else if (rank === 2) {
      targetColor = '#c0c0c0'; // Silver
      targetFontSize = '14px'; // Second largest for second place
    } else if (rank === 3) {
      targetColor = '#cd7f32'; // Bronze
      targetFontSize = '13px'; // Third largest for third place
    } else {
      targetColor = 'rgba(0, 0, 0, 0.05)'; // Default background
      targetFontSize = '12px'; // Default font size for lower ranks
    }

    // Use anime.js to smoothly transition the background color
    anime({
      targets: entryRef.current,
      backgroundColor: targetColor,
      fontSize: targetFontSize,
      duration: 500, // Duration of the color transition
      easing: 'easeInOutQuad', // Easing for smooth transition
    });
  }, [rank]); // Re-run the effect when rank changes

  return (
    <li className={`leaderBoardRow`} ref={entryRef} data-name={name}> {/* Add data-name attribute */}
      <div className='rowContent'>
        <span className='rank'>{rank}</span>
        <span className='name'>{name}</span>
        <span className='value'>{value}</span>
      </div>
    </li>
  );
};

export default LeaderBoardEntry;
