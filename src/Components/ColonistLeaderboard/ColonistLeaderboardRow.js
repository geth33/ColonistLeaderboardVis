import React, { useEffect, useRef } from 'react';
import './ColonistLeaderboardRow.css'; // Import CSS for styling
import {
  getTwemojiFlagURL
} from '../../utils/importDataUtils';

const ColonistLeaderboardRow = ({ player}) => {

  return (
    <tr>
        <td className='alignLeft'>#{player?.playerRank}</td>
        <td className='alignLeft usernameColumnWidth usernameColumn'>            
            <img style={{width: '20px', marginLeft: '10px', marginRight: '10px'}} src={getTwemojiFlagURL(player.countryCode)}/> {player?.username}
        </td>
        <td className='alignCenter divisionCell' style={{padding: '0'}}><img style={{width: '28px'}} src='/img/diamond.png'/></td>
        <td className='alignRight'>{player?.skillRating}</td>
        <td className='alignRight'>{player?.winRate != null && Number(player.winRate) ? Number(player.winRate).toFixed(1) : player.winRate}%</td>
        <td className='alignRight'>{player?.totalGamesPlayed}</td>
    </tr>
  );
};

export default ColonistLeaderboardRow;
