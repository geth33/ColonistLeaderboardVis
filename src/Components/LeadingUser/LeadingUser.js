import React, { useEffect, useRef, useState } from 'react';
import './LeadingUser.css'; // Import CSS for styling


const LeadingUser = ({ data, currSnapshot }) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [prevLeader, setPrevLeader] = useState("");

  useEffect(() => {
    if (data){
        if (data[currSnapshot].username !== prevLeader){
            setPrevLeader(data[currSnapshot].username);
            setCurrentStreak(0.5);
        } else {
            setCurrentStreak(currentStreak + 0.5)
        }
    }
  }, [currSnapshot]);

  return (
    <div className='leadingUserContainer'>
        {
            data && <>
            <div>
                <div style={{display: 'flex'}}>
                    <img src="/userHat.png" alt="User" style={{height: '75px', width: '75px'}}/>
                    <div style={{fontSize:'16px', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))', textAlign: 'left', flex: '1'}}>
                        <h3 style={{marginBottom: '0'}}>{data[currSnapshot].username}</h3>
                        <p style={{marginTop: '0.5em', fontSize: '14px'}}>#1 for {currentStreak} days</p>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', flex:'1', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{margin: '0 0 0.25em 0', alignSelf: 'center', fontSize: '18px', textAlign: 'left', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))'}}>{data[currSnapshot].skillRating}</p>
                        <p style={{margin: '0', alignSelf: 'center', fontSize: '14px', textAlign: 'left', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))'}}>{data[currSnapshot].winRate}% wr - ({data[currSnapshot].totalGamesPlayed} games)</p>
                    </div>
                </div>
            </div>
            </>
        }
    </div>
  );
};

export default LeadingUser;
