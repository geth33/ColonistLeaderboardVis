import React, { useEffect, useRef } from 'react';
import './LeaderboardTopper.css'; // Import CSS for styling


const LeaderboardTopper = ({ rank, name, value}) => {
  const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'default';
  const imgSrc = "/img/" + rankClass + "Laurel.png";
  const imgClass = rankClass + "Topper";

  return (
    <div className={`leaderboardTopperContainer ${rankClass}TopperContainer`}>
        <img
            src={imgSrc}
            className={imgClass}
          />
        <p className={`leaderboardTopperName ${rankClass}TopperText`}>{name}</p>
        <p className={`leaderboardTopperValue ${rankClass}TopperText`}>{value}</p>
    </div>
  );
};

export default LeaderboardTopper;
