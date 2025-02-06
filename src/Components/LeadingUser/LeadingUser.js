import React, { useEffect, useRef, useState } from 'react';
import './LeadingUser.css'; // Import CSS for styling


const LeadingUser = ({ data, currSnapshot }) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [prevLeader, setPrevLeader] = useState("");

  useEffect(() => {
    if (data && data[currSnapshot]){
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
                    {/* <img src="/img/userHat.png" alt="User" style={{height: '80px', width: '80px', margin: '0 1em 0 2em'}}/> */}
                    <div style={{fontSize:'1.5em', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))', textAlign: 'left', flex: '1', margin: '0 1em 0 2em'}}>
                        <h3 style={{margin: '0.6em 0 0 0', fontSize:'1.5em'}}>{data[currSnapshot]?.username}</h3>
                        <p style={{marginTop: '0.5em', fontSize: '14px', fontWeight: 'bold'}}>#1 for {currentStreak} days</p>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', flex:'1', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{margin: '0 0 0.25em 0', alignSelf: 'center', fontSize: '18px', textAlign: 'left', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))', fontWeight: 'bold'}}>{data[currSnapshot]?.skillRating}</p>
                        <p style={{margin: '0', alignSelf: 'center', fontSize: '14px', textAlign: 'left', color: 'white', filter: 'drop-shadow(2px 4px 4px rgba(20,20,20,0.4))'}}>{data[currSnapshot]?.winRate}% wr - ({data[currSnapshot]?.totalGamesPlayed} games)</p>
                    </div>
                </div>
            </div>
            </>
        }
    </div>
  );
};

export default LeadingUser;
