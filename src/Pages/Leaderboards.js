import React, { useState, useEffect } from 'react';
import Loader from '../Components/Loader/Loader';
import { Button, Backdrop, FormControl, FormControlLabel, Select, MenuItem, Checkbox, Tooltip, Alert, TextField } from "@mui/material";

import { observer } from 'mobx-react-lite';
import { useStore } from '../Store/storeProvider';
import GameModeOption from '../Components/ColonistLeaderboard/GameModeOption';
import ColonistLeaderboardRow from '../Components/ColonistLeaderboard/ColonistLeaderboardRow';
import '../Components/ColonistLeaderboard/Leaderboards.css';

const LeaderBoards = () => {

    const [players, setPlayers] = useState([]);
    const [activeGameMode, setActiveGameMode] = useState("4 Player");
    const [season, setSeason] = useState(6);
    const [seasons, setSeasons] = useState([6,7,8,9,10,11,12,13,14,15,16,17]);
    const [username, setUsername] = useState('');
    const [debouncedUsername, setDebouncedUsername] = useState('');
    const [fetchingData, setFetchingData] = useState(false);

    const store = useStore();

    // 1. Debounce logic for search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUsername(username);
        }, 300);

        return () => clearTimeout(timer); // Reset timer if user types again within 300ms
    }, [username]);

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const retrieveChartDataFromStore = () => {
        setTimeout(() => {
            if (store.oneOnOneSeasonFinalRankingMap && activeGameMode === '1v1') {
                setPlayers(store.oneOnOneSeasonFinalRankingMap[season] || []);
                setFetchingData(false);
            } else if (store.baseSeasonFinalRankingMap && activeGameMode === '4 Player') {
                setPlayers(store.baseSeasonFinalRankingMap[season] || []);
                setFetchingData(false);
            }
        }, 0);
    };

    useEffect(() => {
        retrieveChartDataFromStore();
    }, [
        store.oneOnOneData,
        store.baseData,
        store.oneOnOneSeasonFinalRankingMap,
        store.baseSeasonFinalRankingMap,
        season
    ]);

    useEffect(() => {
        if (activeGameMode === '1v1'){
            if (store.oneOnOneData && store.oneOnOneSeasonFinalRankingMap){
                setFetchingData(false);
                retrieveChartDataFromStore();
            } else {
                setFetchingData(true);
                store.loadOneOnOneData();
            }
        } else {
            if (store.baseData){
                setFetchingData(false);
                retrieveChartDataFromStore();
            } else {
                setFetchingData(true);
                store.loadBaseData();
            }
        }
    }, [activeGameMode]);

    // 2. Filter players substring match against debounced term (case-insensitive)
    const filteredPlayers = players.filter((player) => {
        if (!debouncedUsername) return true;
        return player?.username?.toLowerCase().includes(debouncedUsername.toLowerCase());
    });

    return (
        <div className='colonistLeaderboardPage'>
            <Backdrop 
                open={fetchingData}
                sx={{ zIndex: 1001 }}
            >
                <Loader/>
            </Backdrop>
            <div className="colonistLeaderboardMainContainer">
                <div className='colonistGameModeLeaderboard'>
                    <GameModeOption img="/img/4player.png" title="4 Player" active={activeGameMode === '4 Player'} setActiveGameMode={setActiveGameMode}/>
                    <GameModeOption img="/img/1v1.png" title="1v1" active={activeGameMode === '1v1'} setActiveGameMode={setActiveGameMode}/>
                </div>
                <div className='colonistLeaderboardContainer'>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div className="globalContainer">
                            <span>Global</span>
                        </div>
                        <div className='colonistLeaderboardSettingsContainer'>
                            <div className='seasonContainer'>
                                <span className='colonistLeaderboardSettingsLabel'>Season</span>
                                <FormControl size="small">
                                    <Select className='settingsSelect' sx={{ fontSize: '0.9rem' }} value={season} onChange={(e) => {setSeason(e.target.value);}}>
                                        {seasons.map((seasonVal, num) => (
                                            <MenuItem value={seasonVal} key={num}>
                                                {seasonVal}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='searchContainer'>
                                <span className='colonistLeaderboardSettingsLabel'>Search</span>
                                <TextField
                                    id="outlined-basic"
                                    variant="standard"
                                    className="playerNameField"
                                    placeholder="Enter Username" 
                                    value={username}
                                    onChange={handleUsernameChange}
                                    InputProps={{ disableUnderline: true }} 
                                    style={{ marginRight: '1em', padding:'0 5px'}}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="leaderboardTable">
                        <table>
                            <thead>
                                <tr>
                                    <th className="tableHeaderCell alignLeft">Rank</th>
                                    <th className="tableHeaderCell usernameColumnWidth alignLeft">Player</th>
                                    <th className="tableHeaderCell alignCenter divisionColumn">Division</th>
                                    <th className="tableHeaderCell alignRight">Rating</th>
                                    <th className="tableHeaderCell alignRight">Win %</th>
                                    <th className="tableHeaderCell alignRight">Games</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlayers && filteredPlayers.length > 0 ? (
                                    filteredPlayers.map((player, index) => (
                                        <ColonistLeaderboardRow player={player} key={player.id || index}/>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                            No players found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default observer(LeaderBoards);