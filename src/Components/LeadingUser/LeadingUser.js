import React, { useEffect, useRef, useState } from 'react';
import './LeadingUser.css'; // Import CSS for styling
import constants from '../../utils/constants';


const LeadingUser = ({ data, currSnapshot }) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [prevLeader, setPrevLeader] = useState("");
  const [leadingUserInfo, setLeadingUserInfo] = useState(null);
  const [alias, setAlias] = useState(null);
  const { notablePlayersMap } = constants;

  useEffect(() => {
    if (data && data[currSnapshot]){
        let info = notablePlayersMap[data[currSnapshot].username];
        if (info != null && info.alias){
            setLeadingUserInfo(notablePlayersMap[info.alias]);
            setAlias(info.alias);
        } else {
            setLeadingUserInfo(notablePlayersMap[data[currSnapshot].username]);
            setAlias('');
        }
        if (data[currSnapshot].username !== prevLeader){
            setPrevLeader(data[currSnapshot].username);
            setCurrentStreak(0.5);
        } else {
            setCurrentStreak(currentStreak + 0.5)
        }
    }
  }, [currSnapshot]);

  return (
    <div className='leadingUserContainer' style={{filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))'}}>
        {
            data && <>
            <div>
                <div style={{display: 'flex'}} className='goldBackground'>
                    <img src={leadingUserInfo?.imageURL ? leadingUserInfo.imageURL : "/img/mysteryPortrait.png"} alt="User" style={{height: '83px', width: '83px', margin: '0 0 0 4px', alignSelf: 'center'}}/>
                    <div style={{
                        fontSize: '1.5em', 
                        color: 'white', 
                        filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))', 
                        textAlign: 'left', 
                        flex: alias ? '1.5' : '1', // Set flex dynamically
                        margin: '0 1em 0 1em'
                    }}>                        
                        <h3 style={{margin: '0.6em 0 0 0', fontSize:'1.5em', display: 'flex', alignItems: 'center'}}>{alias ? alias + ' (alt)' : data[currSnapshot]?.username} <img style={{width: '30px', marginLeft: '10px'}} src={data[currSnapshot]?.flagURL}/></h3>
                        {
                            leadingUserInfo?.facts ? <>
                                <p style={{marginTop: '0.2em', fontStyle: 'italic', marginBottom: '0', fontSize: '14px', fontWeight: 'bold'}}>{leadingUserInfo?.facts[0]}</p>
                                <p style={{marginTop: '0.2em', fontStyle: 'italic', fontSize: '14px', fontWeight: 'bold', minHeight: '18px'}}>{leadingUserInfo?.facts[1]}</p>
                            </> : <p style={{marginTop: '0.2em', fontStyle: 'italic', marginBottom: '0', fontSize: '14px', fontWeight: 'bold', minHeight: '48px'}}>
                                {currentStreak} days in first
                            </p>
                        }
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', flex:'1', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{margin: '0 0 0.25em 0', alignSelf: 'center', fontSize: '18px', textAlign: 'left', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))', fontWeight: 'bold'}}>{data[currSnapshot]?.winRate}% wr</p>
                        <p style={{margin: '0', alignSelf: 'center', fontSize: '14px', textAlign: 'left', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))'}}>({data[currSnapshot]?.totalGamesPlayed} games)</p>
                    </div>
                </div>
            </div>
            </>
        }
    </div>
  );
};

export default LeadingUser;
