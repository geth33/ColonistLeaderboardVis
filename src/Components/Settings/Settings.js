import React, { useEffect, useRef, useState } from 'react';
import './Settings.css'; // Import CSS for styling
import {Button, FormControl, FormControlLabel, Select, MenuItem, Checkbox, Tooltip, Alert} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayerSelectorGrid from './PlayerSelectorGrid';

const seasons = [7,8,9,10,11];
const speeds = [0.5, 0.75, 1, 1.25, 1.5];
const currentSeasonDays = [1,5,10,20,30];
const finishedSeasonDays = [1,5,10,20,30,40,50,60,70,80];
const numOfPlayers = [5,10,15,20];
const numOfPlayersSeason = [1,5,10,20,50,100,200];

const Settings = ({hide, playersWithoutData}) => {
  const [lineChartMode, setLineChartMode] = useState(0);
  const [gameMode, setGameMode] = useState("1v1");
  const [season, setSeason] = useState(7);
  const [speed, setSpeed] = useState(1);
  const [selectableDays, setSelectableDays] = useState(finishedSeasonDays);
  const [selectedDay, setSelectedDay] = useState(1);
  const [submittedWithEmptyRows, setSubmittedWithEmptyRows] = useState(false);
  const [playerNum, setPlayerNum] = useState(10);
  const [enteringCheckboxChecked, setEnteringCheckboxChecked] = useState(false);
  const [leavingCheckboxChecked, setLeavingCheckboxChecked] = useState(false);
  const [playerData, setPlayerData] = useState([]);

  const handlePlayerDataChange = (updatedData) => {
    setPlayerData(updatedData);
  };

  const playerRowsAreBlank = () => {
    for (let player of playerData){
        if (player.username == "" || player.seasons.length === 0){
            return true;
        }
    }
    return false;
  }

  const submitForm = () => {
    if (lineChartMode === 1){
        if (playerRowsAreBlank()){
            setSubmittedWithEmptyRows(true);
            return;
        } else {
            setSubmittedWithEmptyRows(false);
        }
    }
    dispatchInitiateChartEvent();
  }

  const dispatchInitiateChartEvent = () => {
    const event = new CustomEvent("initiateChart", { 
        detail: { 
                lineChartMode: lineChartMode,
                gameMode: gameMode,
                season: season,
                speed: speed,
                startingSnapshot: selectedDay * 2,
                playerNum: playerNum,
                entering: enteringCheckboxChecked,
                leaving: leavingCheckboxChecked,
                players: playerData
            } 
        });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    if (lineChartMode === 0 || lineChartMode === 2){
        setPlayerNum(10);
    }
  }, [lineChartMode])

  useEffect(() => {
    // If going to the current season, need to make
    if (season === 11){
        setSelectableDays(currentSeasonDays);
        if (selectedDay > 30){
            setSelectedDay(10);
        }
    } else {
        setSelectableDays(finishedSeasonDays);
    }
  }, [season])


  return (
    <div className='settingsContainer' style={{display: hide ? 'none' : ''}}>
        <div className='lineChartModeContainer'>
            <div className='lineChartModeButtonContainer'>
                <div className='lineChartModeButton'>
                    <p className='buttonHeaderText buttonHeadTextEmpty'></p>
                    <Button className={`settingsButton ${lineChartMode === 0 ? 'selected' : 'notSelected'}`} onClick={(e) => {setLineChartMode(0)}}>
                        <img src="/img/crown.png" alt="crown" className={'buttonImage'}/>
                        <div className='settingsButtonText'>
                            <p>Fight</p>
                            <p className='settingsButtonTextSmall'>for the</p>
                            <p>Crown</p>
                        </div>
                    </Button>
                </div>
                <div className='lineChartModeButton'>
                    <p className='buttonHeaderText buttonHeadTextEmpty'></p>
                    <Button className={`settingsButton ${lineChartMode === 1 ? 'selected' : 'notSelected'}`} onClick={(e) => {setLineChartMode(1)}}>
                        <img src="/img/swordClash.png" alt="crown" className={'buttonImage'}/>
                        <div className='settingsButtonText'>
                            <p>Head</p>
                            <p className='settingsButtonTextSmall'>to</p>
                            <p>Head</p>
                        </div>
                    </Button>
                </div>
                <div className='lineChartModeButton'>
                    <p className='buttonHeaderText buttonHeadTextEmpty'></p>
                    <Button className={`settingsButton ${lineChartMode === 2 ? 'selected' : 'notSelected'}`} onClick={(e) => {setLineChartMode(2)}}>
                        <img src="/img/stopwatch.png" alt="crown" className={'buttonImage'}/>
                        <div className='settingsButtonText'>
                            <p>Clash</p>
                            <p className='settingsButtonTextSmall'>of</p>
                            <p>Seasons</p>
                        </div>
                    </Button>
                </div>
                <div className='lineChartModeButton'>
                    <p className='buttonHeaderText buttonHeadTextNonEmpty'>Coming soon!</p>
                    <Button className='settingsButton disabled comingSoon' disabled>
                        <img src="/img/map.png" alt="crown" className={'buttonImage'}/>
                        <div className='settingsButtonText'>
                            <p>Solo</p>
                            <p>Journey</p>
                        </div>
                    </Button>
                </div>
            </div>
            <div className='lineChartModeSubtextContainer'>
                {
                    lineChartMode === 0 && <p className='lineChartModeText'>Watch the battle at the top of the leaderboard!</p>
                }
                {
                    lineChartMode === 1 && <p className='lineChartModeText'>Select players across seasons to battle!</p>
                }
                {
                    lineChartMode === 2 && <p className='lineChartModeText'>Compare overall average ratings between seasons!</p>
                }
            </div>
        </div>
        <div className='gameModeContainer'>
            <Button className={`settingsButton ${gameMode === 'Base' ? 'selected' : 'notSelected'}`} onClick={(e) => {setGameMode('Base')}}>
                <img src="/img/sheep.png" alt="crown" style={{height: '25px', width: '25px'}}/>
                <div className='settingsButtonText'>
                    <p>Base</p>
                </div>
            </Button>
            <Button className={`settingsButton ${gameMode === '1v1' ? 'selected' : 'notSelected'}`} onClick={(e) => {setGameMode('1v1')}}>
                <img src="/img/fight.png" alt="crown" style={{height: '25px', width: '25px'}}/>
                <div className='settingsButtonText'>
                    <p>1v1</p>
                </div>
            </Button>
        </div>
        <div className='settingsGroup1'>
                    {
                        lineChartMode === 0 &&
                            <div className='setting setting1'>
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
                    }
                    <div className='setting setting2'>
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
                    {
                        lineChartMode === 0 &&
                            <div className='setting setting3'>
                                <span className='settingsLabel'># of Players</span>
                                <FormControl size="small">
                                    <Select className='settingsSelect' value={playerNum} onChange={(e) => {setPlayerNum(e.target.value);}}>
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
                    }
                    <div className='setting setting2'>
                        <span className='settingsLabel'>Start Day</span>
                        <FormControl size="small">
                            <Select className='settingsSelect' sx={{ fontSize: '0.9rem' }} value={selectedDay} onChange={(e) => {setSelectedDay(e.target.value);}}>
                                {
                                selectableDays.map((day, num) => (
                                    <MenuItem
                                        value={day}
                                        key={num}
                                    >
                                        {day}
                                    </MenuItem>
                                    ))
                                    }
                            </Select>
                        </FormControl>
                    </div>
                </div>
        {
            lineChartMode === 0 &&
            <>
            <div className='settingsGroup2'>
                    <div className='setting setting3'>
                        <span className='settingsLabel'>Show Players:</span>
                        <FormControlLabel control={<Checkbox checked={enteringCheckboxChecked} onChange={() => {setEnteringCheckboxChecked(!enteringCheckboxChecked)}}
                            sx={{
                                color: 'white',
                                '&.Mui-checked': {
                                color: 'white',
                                },
                            }}/>} sx={{color: 'white', fontSize: '12px', fontWeight: 'bold'}} label="Entering" />
                        <FormControlLabel control={<Checkbox checked={leavingCheckboxChecked} onChange={() => {setLeavingCheckboxChecked(!leavingCheckboxChecked)}}
                            sx={{
                                color: 'white',
                                '&.Mui-checked': {
                                color: 'white',
                                },
                            }}/>} sx={{color: 'white', fontSize: '12px', fontWeight: 'bold'}} label="Leaving" />
                        <Tooltip title={
                            <React.Fragment>
                                <p style={{fontWeight: 'bold', fontSize: '13px'}}>Show players entering/exiting the top ranks.</p>
                                <p>
                                    It's generally recommended to leave these unchecked when viewing 1v1 leaderboards or if you have more than 10 players on the graph.
                                </p>
                                <p>
                                    The graph can get slightly disorienting if lots of players are entering/exiting. 
                                    It's very common for players to go on massive win/lose streaks when they are entering/exiting the top ranks.
                                </p>
                            </React.Fragment>
                        }
                                                                                placement="right"
                                                                                style={{display: 'inline', marginLeft: '0.5em'}}>
                            <Button style={{margin: '0', padding: '0', minWidth: '1.2em', maxHeight: '1.2em', alignSelf: 'center'}}><HelpOutlineIcon size={'1.2em'} color={'white'} sx={{color: 'white'}}/></Button>
                        </Tooltip>
                    </div>
                </div>
        </>
        }
        {
            lineChartMode === 1 && <>
                <div style={{ margin: '3em auto 1.5em', maxWidth: '40em', overflow: 'hidden' }}>
                    <Alert severity="info" style={{ maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                        Note: Data is only for time spent in top 200. <br/>Also, Season 10 is missing days 5-19 and 49-66.
                    </Alert>
                </div>
                <div style={{justifyContent: 'center', display: 'flex'}}>
                    <div className='setting setting3'>
                        <PlayerSelectorGrid onPlayerDataChange={handlePlayerDataChange}/>
                    </div>
                </div>
            </>
        }
        {
            lineChartMode === 2 &&
                <div className='settingsGroup4'>
                    <div className='setting setting3'>
                        <span className='settingsLabel'>Display average rating for top</span>
                        <FormControl size="small">
                            <Select className='settingsSelect' value={playerNum} onChange={(e) => {setPlayerNum(e.target.value);}}>
                                {numOfPlayersSeason.map((playerNum, num) => (
                                    <MenuItem
                                        value={playerNum}
                                        key={num}
                                    >
                                        {playerNum}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <span className='settingsLabel' style={{marginLeft: '1em'}}> players.</span>
                    </div>
                </div>
        }
        <div className='generateChartButtonContainer'>
            <Button id='generateChartButton' className='settingsButton' onClick={() => {submitForm();}}>
                <div className='settingsButtonText'>
                    <p id='generateChartText'>Generate Chart</p>
                </div>
            </Button>
        </div>
        {
  lineChartMode === 1 && playersWithoutData?.length > 0 && !submittedWithEmptyRows && (
    <div style={{ margin: '1.5em auto 0em', maxWidth: '40em', overflow: 'hidden' }}>
      <Alert severity="error" style={{ maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
        The following users do not have data for the selected seasons: {playersWithoutData?.join(", ")}. Either remove these players or expand your season selection.
      </Alert>
    </div>
  )
}
{
  lineChartMode === 1 && submittedWithEmptyRows && (
    <div style={{ margin: '1.5em auto 0em', maxWidth: '30em', overflow: 'hidden' }}>
      <Alert severity="error" style={{ maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
        Please fill out the season and username for each row.
      </Alert>
    </div>
  )
}

    </div>
  );
};

export default Settings;
