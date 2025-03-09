import React, { useEffect, useRef } from 'react';
import './LeaderBoardEntry.css'; // Import CSS for styling
import anime from 'animejs';


const LeaderBoardEntry = ({ rank, name, value, flagURL, subValue, isNew, size }) => {
  const entryRef = useRef(null); // Reference to the DOM element
  const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'default';

  useEffect(() => {

    // Use anime.js to smoothly transition the background color
    anime({
      targets: entryRef.current,
      duration: 500, // Duration of the color transition
      easing: 'easeInOutQuad', // Easing for smooth transition
    });
  }, [rank]);

  return (
    <li className={`leaderBoardRow ${rankClass} ${isNew ? "new" : ""}`} ref={entryRef} data-name={name}> {/* Add data-name attribute */}
      <div className={`rowContent ${size}`}>
        <span className='rank'>{rank}</span>  
          <span className='name'>{name} 
          {
          size !== 'small' &&
            <img style={{width: '20px', marginLeft: '10px'}} src={flagURL}/>
          }
          </span>
        
        {
          subValue !== '' ? <div>
              <p className='value'>{value}</p>
              <p className='subValue'>{subValue}</p>
            </div>
          : <span className='value' style={{width: size === 'small' ? '80px' : '60px'}}>{value}</span>
        }
      </div>
    </li>
  );
};

export default LeaderBoardEntry;
