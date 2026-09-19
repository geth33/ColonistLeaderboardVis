import React, { useEffect, useRef } from 'react';
import './LeaderboardTopper.css'; // Import CSS for styling

const formatValue = (val) => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/\.0$/, '');
  };


const LeaderboardTopper = ({ rank, name, value, suffix, secondaryValue, secondarySuffix}) => {
  const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'default';
  const imgSrc = "/img/" + rankClass + "Laurel.png";
  const imgClass = rankClass + "Topper";

  const formattedValue = formatValue(value);

  return (
    <div className={`leaderboardTopperContainer ${rankClass}TopperContainer`}>
        <img
            src={imgSrc}
            className={imgClass}
          />
        <p className={`leaderboardTopperName ${rankClass}TopperText`}>{name}</p>
        <p className={`leaderboardTopperValue ${rankClass}TopperText`}>{formattedValue}{suffix ? suffix : ''}</p>
        {
          secondaryValue && <p className={`leaderboardTopperValue ${rankClass}TopperText secondaryValue`}>({secondaryValue} {secondarySuffix})</p>
        }
    </div>
  );
};

export default LeaderboardTopper;
