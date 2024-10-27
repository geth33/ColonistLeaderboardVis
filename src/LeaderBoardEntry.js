import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import './LeaderBoardEntry.css'; // Import CSS for styling

const LeaderBoardEntry = ({ rank, name, value }) => {
  const entryRef = useRef(null); // Reference to the DOM element
  const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'default';

  // Animate the background color change based on rank
  useEffect(() => {
    let targetFontSize = '12px';

    if (rank === 1) {
      targetFontSize = '16px'; // Largest for first place
    } else if (rank === 2) {
      targetFontSize = '14px'; // Second largest for second place
    } else if (rank === 3) {
      targetFontSize = '13px'; // Third largest for third place
    } else {
      targetFontSize = '12px'; // Default font size for lower ranks
    }

    // Use anime.js to smoothly transition the background color
    anime({
      targets: entryRef.current,
      fontSize: targetFontSize,
      duration: 500, // Duration of the color transition
      easing: 'easeInOutQuad', // Easing for smooth transition
    });
  }, [rank]); // Re-run the effect when rank changes

  return (
    <li className={`leaderBoardRow ` + rankClass} ref={entryRef} data-name={name}> {/* Add data-name attribute */}
      <div className='rowContent'>
        <span className='rank'>{rank}</span>
        <span className='name'>{name}</span>
        <span className='value'>{value}</span>
      </div>
    </li>
  );
};

export default LeaderBoardEntry;
