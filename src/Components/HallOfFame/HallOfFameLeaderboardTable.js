import React, { useState, useRef, useEffect } from 'react';
import './HallOfFameLeaderboardTable.css';
import HallOfFameLeaderboardTableEntry from './HallOfFameLeaderboardTableEntry';

const HallOfFameLeaderboardTable = ({ entries, property, suffix, secondaryProperty, secondarySuffix }) => {
  const containerRef = useRef(null);
  const [isMaskActive, setIsMaskActive] = useState(true);

  const checkScrollPosition = () => {
    const el = containerRef.current;
    if (!el) return;

    // Check if scrolled within 2px of the bottom (or if content is shorter than container)
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 2;
    setIsMaskActive(!isAtBottom);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial check in case entries don't overflow the container
    checkScrollPosition();

    el.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [entries]);

  return (
    <div 
      ref={containerRef} 
      className={`tableContainer ${isMaskActive ? 'hasMask' : ''}`}
    >
      <table className='hallOfFameLeaderboardTable'>
        <tbody>
          {entries?.map((entry, index) => (
            <HallOfFameLeaderboardTableEntry
              key={entry.id || entry.rank || index}
              rank={entry.rank}
              name={entry.username}
              value={entry[property]}
              suffix={suffix}
              secondaryValue={entry[secondaryProperty]}
              secondarySuffix={secondarySuffix}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HallOfFameLeaderboardTable;