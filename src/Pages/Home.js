import React, { useState, useEffect } from 'react';
import LeaderBoard from '../Components/LeaderBoard/LeaderBoard';
import LineChart from '../Components/LineChart/LineChart';
import Settings from '../Components/Settings/Settings';
import {
	Tab, tabClasses,
	Tabs,
	tabsClasses
} from "@mui/material";
import {
  readDataFromFile
} from '../utils/importDataUtils';
import {
  createSeasonDataStruct,
  generateSnapshotMaps
} from '../utils/prepareLineChartUtils';
import LeadingUser from '../Components/LeadingUser/LeadingUser';

export const tabsStyles = () => ({
	root: {
		backgroundColor: "#eee",
		borderRadius: "10px",
		minHeight: 36,
    maxHeight: 36, // Set max height for the tab item
	},
	flexContainer: {
		position: "relative",
		padding: "0 3px",
		zIndex: 1,
	},
	indicator: {
		top: 3,
		bottom: 3,
		right: 3,
		height: "auto",
		borderRadius: "8px",
		backgroundColor: "#fff",
		boxShadow: "0 4px 12px 0 rgba(0,0,0,0.16)",
	},
});

export const tabItemStyles = (theme) => ({
	root: {
		fontWeight: 500,
		minHeight: 36,
    maxHeight: 36, // Set max height for the tab item
		minWidth: 96,
		opacity: 0.7,
		color: theme.palette.text.primary,
		textTransform: "initial",
		"&:hover": {
			opacity: 1,
			backgroundColor: 'transparent'
		},
		[`&.${tabClasses.selected}`]: {
			color: '#0A70E9',
			opacity: 1,
		},
		[theme.breakpoints.up("md")]: {
			minWidth: 120,
		},
	},
});

function toSx(styles, classes) {
	return function sxCallback(theme) {
		let sx = {};
		Object.entries(styles(theme)).forEach(([key, value]) => {
			if (key === "root") {
				sx = { ...sx, ...value };
			} else {
				sx[`& .${classes[key]}`] = value;
			}
		});
		return sx;
	};
}

const Home = () => {
  const [allData, setAllData] = useState(null);
  const [playerRatingMap, setPlayerRatingMap] = useState(null);
  const [topPlayersAtTimeMap, setTopPlayersAtTimeMap] = useState(null);
  const [minMap, setMinMap] = useState(null);
  const [maxMap, setMaxMap] = useState(null);
  const [top1RankMap, setTop1RankMap] = useState(null);
  const [top10RankMap, setTop10RankMap] = useState(null);
  const [top5WinRateMap, setTop5WinRateMap] = useState(null);
  const [timeInFirstPlaceMap, setTimeInFirstPlaceMap] = useState(null);
  const [currSnapshot, setCurrSnapshot] = useState(10);
  const [tabIndex, setTabIndex] = React.useState(0);
	const tabItemSx = toSx(tabItemStyles, tabClasses);
  const [tabLabel, setTabLabel] = useState("Settings");
  const [settings, setSettings] = useState(null);

  const season = 8;
  const numOfTicksOnGraph = 180;
  const lineChartSpeed = 25;
  const numOfPlayersOnChart = 10;
  const startingSnapshot = 10;


useEffect(() => {
  if (allData){
    createSeasonDataStruct(allData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, settings.season, settings.playerNum, startingSnapshot, numOfTicksOnGraph);
    const {top10RankMap, top5WinRateMap, timeInFirstPlaceMap} = generateSnapshotMaps(allData, settings.season, startingSnapshot);
    setTop1RankMap(Object.fromEntries(Object.entries(top10RankMap).map(([key, array]) => [key, array[0]])));
    setTop10RankMap(top10RankMap);
    setTop5WinRateMap(top5WinRateMap);
    setTimeInFirstPlaceMap(timeInFirstPlaceMap);
    setTabIndex(1);
  }
}, [allData]);

useEffect(() => {
  if (settings != null){
    let csvFileName = settings.gameMode === '1v1' ? '/leaderboards_oneOnOne.csv' : '/leaderboards_base.csv';
    readDataFromFile(csvFileName, setAllData);
  }
}, [settings]);

useEffect(() => {
  const handleTickEvent = (e) => {
    const { snapshot } = e.detail;
    setCurrSnapshot(startingSnapshot + snapshot);
  };

  window.addEventListener("nextSnapshot", handleTickEvent);

  return () => window.removeEventListener("nextSnapshot", handleTickEvent);
}, []);

useEffect(() => {
  const handleInitiateChartEvent = (e) => {
    setSettings(e.detail);
  };

  window.addEventListener("initiateChart", handleInitiateChartEvent);

  return () => window.removeEventListener("initiateChart", handleInitiateChartEvent);
}, []);

  return (
    <div className='visContainer'>
        <LineChart playerData={playerRatingMap} topPlayersAtTimeMap={topPlayersAtTimeMap} 
        minMap={minMap} maxMap={maxMap} numOfTicksOnGraph={numOfTicksOnGraph} lineChartSpeed={settings?.speed ? lineChartSpeed/settings.speed : lineChartSpeed}/>
        <div className="supportingContentContainer">
          <div className='tabModule'>
            <Tabs
                value={tabIndex}
                onChange={(e, index) => {setTabIndex(index); setTabLabel(e.target.textContent);}}
                sx={toSx(tabsStyles, tabsClasses)}
              >
                <Tab disableRipple label={"Settings"} sx={tabItemSx} />
                <Tab disableRipple label={"Leaderboards"} sx={tabItemSx}/>
						</Tabs>
          </div>
          {
            tabIndex === 0 ? <>
              <Settings/>
            </> : 
            <div className='supportingVisContainer'>
              <div className='leaderboardItem leadingUserModule'>
                <LeadingUser data={top1RankMap} currSnapshot={currSnapshot}/>
              </div>
              <div className='leaderboardItem leaderboardItem1'>
                <LeaderBoard title="Top Rating" data={top10RankMap} leaderBoardMetric="skillRating" size={10} currSnapshot={currSnapshot}/>
              </div>

              <div className='leaderboardItem leaderboardItem2'>
                <LeaderBoard title="Top Win Rate" data={top5WinRateMap} leaderBoardMetric="winRate" size={5} currSnapshot={currSnapshot}/>
              </div>

              <div className='leaderboardItem leaderboardItem3'>
                <LeaderBoard title="Time in First" data={timeInFirstPlaceMap} leaderBoardMetric="daysInFirst" size={3} currSnapshot={currSnapshot}/>
              </div>
            </div>
          }
          </div>
    </div>
  );
};

export default Home;
