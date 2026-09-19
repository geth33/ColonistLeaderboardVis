import React, { useEffect, useRef } from 'react';
import './HallOfFameLeaderboardTableEntry.css';
import { Sick } from '@mui/icons-material';

const formatValue = (val) => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/\.0$/, '');
  };

const HallOfFameLeaderboardTableEntry = ({ rank, name, value, suffix, secondaryValue, secondarySuffix }) => {
    const formattedValue = formatValue(value);

  return (
    <tr className='hallOfFameLeaderboardTableEntry'>
        <td style={{width: secondaryValue ? '20%' : '15%'}}>{rank}</td>
        <td style={{width: secondaryValue ? '60%' : '70%'}}>{name}</td>
        <td style={{width: secondaryValue ? '20%' : '15%'}}>
          {formattedValue}{suffix ? suffix : ''}
          {
            secondaryValue && <>
              <p style={{padding: 0, margin: 0, fontSize: '0.6rem'}}>({secondaryValue} {secondarySuffix})</p> 
            </> 
          }
        </td>
    </tr>
  );
};

export default HallOfFameLeaderboardTableEntry;
