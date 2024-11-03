import React, { useEffect, useRef, useState } from 'react';
import './Settings.css'; // Import CSS for styling
import {Button, FormControl, Select, MenuItem} from "@mui/material";


const seasons = [7,8,9,10];
const speeds = [0.5, 0.75, 1, 1.25, 1.5];
const numOfPlayers = [5,10,15,20];

const Settings = ({}) => {
  const [lineChartMode, setLineChartMode] = useState(0);
  const [gameMode, setGameMode] = useState("1v1");
  const [season, setSeason] = useState(7);
  const [speed, setSpeed] = useState(1);
  const [playerNum, setPlayerNum] = useState(10);

  const dispatchInitiateChartEvent = () => {
    const event = new CustomEvent("initiateChart", { 
        detail: { 
                lineChartMode: lineChartMode,
                gameMode: gameMode,
                season: season,
                speed: speed,
                playerNum: playerNum
            } 
        });
    window.dispatchEvent(event);
  };


  return (
    <div className='settingsContainer'>
        <div className='lineChartModeContainer'>
            <div className='lineChartModeButtonContainer'>
                <Button className={`settingsButton ${lineChartMode === 0 ? 'selected' : 'notSelected'}`} onClick={(e) => {setLineChartMode(0)}}>
                    <img src="/crown.png" alt="crown" style={{height: '25px', width: '25px'}}/>
                    <div className='settingsButtonText'>
                        <p>Fight</p>
                        <p className='settingsButtonTextSmall'>for the</p>
                        <p>Crown</p>
                    </div>
                </Button>
                <div>
                    <Button className='settingsButton disabled' disabled style={{height: '100%'}}>
                        <img src="/map.png" alt="crown" style={{height: '25px', width: '25px'}}/>
                        <div className='settingsButtonText'>
                            <p>Solo</p>
                            <p>Journey</p>
                        </div>
                    </Button>
                </div>
                <Button className='settingsButton disabled' disabled>
                    <img src="/swordClash.png" alt="crown" style={{height: '25px', width: '25px'}}/>
                    <div className='settingsButtonText'>
                        <p>Head</p>
                        <p className='settingsButtonTextSmall'>to</p>
                        <p>Head</p>
                    </div>
                </Button>
            </div>
            <div className='lineChartModeSubtextContainer'>
                {
                    lineChartMode === 0 && <p>Watch the battle at the top of the leaderboard!</p>
                }
            </div>
        </div>
        <div className='gameModeContainer'>
            <Button className={`settingsButton ${gameMode === 'Base' ? 'selected' : 'notSelected'}`} onClick={(e) => {setGameMode('Base')}}>
                <img src="/sheep.png" alt="crown" style={{height: '25px', width: '25px'}}/>
                <div className='settingsButtonText'>
                    <p>Base</p>
                </div>
            </Button>
            <Button className={`settingsButton ${gameMode === '1v1' ? 'selected' : 'notSelected'}`} onClick={(e) => {setGameMode('1v1')}}>
                <img src="/fight.png" alt="crown" style={{height: '25px', width: '25px'}}/>
                <div className='settingsButtonText'>
                    <p>1v1</p>
                </div>
            </Button>
        </div>
        <div className='settingsGroup'>
            <div className='setting'>
                <span className='settingsLabel'>Season</span>
                <FormControl size="small">
                    <Select className='settingsSelect' sx={{ fontSize: '0.9rem' }} value={season} onChange={(e) => {setSeason(e.target.value);}}>
                        {seasons.map((season, num) => (
                            <MenuItem
                                value={season}
                                key={num}
                            >
                                {season}
                            </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </div>
            <div className='setting'>
                <span className='settingsLabel'>Speed</span>
                <FormControl size="small">
                    <Select className='settingsSelect' sx={{ fontSize: '0.9rem' }} value={speed} onChange={(e) => {setSpeed(e.target.value);}}>
                        {speeds.map((speed, num) => (
                            <MenuItem
                                value={speed}
                                key={num}
                            >
                                {speed}x
                            </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </div>
            <div className='setting'>
                <span className='settingsLabel'># of Players</span>
                <FormControl size="small">
                    <Select className='settingsSelect' sx={{ fontSize: '0.9rem' }} value={playerNum} onChange={(e) => {setPlayerNum(e.target.value);}}>
                        {numOfPlayers.map((playerNum, num) => (
                            <MenuItem
                                value={playerNum}
                                key={num}
                            >
                                {playerNum}
                            </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </div>
        </div>
        <div className='generateChartButton'>
            <Button className='settingsButton' onClick={() => {dispatchInitiateChartEvent();}}>
                <div className='settingsButtonText'>
                    <p>Generate Chart</p>
                </div>
            </Button>
        </div>
    </div>
  );
};

export default Settings;
