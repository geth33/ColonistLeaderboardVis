import React, { useState, useEffect } from 'react';
import LeaderBoard from '../Components/LeaderBoard/LeaderBoard';
import LineChart from '../Components/LineChart/LineChart';
import Settings from '../Components/Settings/Settings';
import Loader from '../Components/Loader/Loader';
import {
	Tab, tabClasses,
	Tabs,
	tabsClasses,
  Backdrop
} from "@mui/material";
// import {
//   readDataFromFile
// } from '../utils/importDataUtils';
import {
  generateTopPlayerLines,
  generateSeasonAverageLines,
  generateSnapshotMaps,
  generateSnapshotMapsForUsers,
  generateSelectedPlayerLines,
  generateTopSeasonSnapshotMap
} from '../utils/prepareLineChartUtils';
import LeadingUser from '../Components/LeadingUser/LeadingUser';
import { observer } from 'mobx-react-lite';
import { useStore } from '../Store/storeProvider';

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

  const numOfTicksOnGraph = window.innerWidth < 800 ? 90 : 180;
  const lineChartSpeed = 25;

const Home = () => {
  const [allSeasonsData, setAllSeasonsData] = useState(null);
  const [playerRatingMap, setPlayerRatingMap] = useState(null);
  const [topPlayersAtTimeMap, setTopPlayersAtTimeMap] = useState(null);
  const [minMap, setMinMap] = useState(null);
  const [maxMap, setMaxMap] = useState(null);
  const [seasonMaxSnapshotMap, setSeasonMaxSnapshotMap] = useState(null);
  const [seasonSnapshotsMap, setSeasonSnapshotsMap] = useState(null);
  const [generatingChart, setGeneratingChart] = useState(false);
  const [inErrorState, setInErrorState] = useState(false);
  const [chartInitialized, setChartInitialized] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [prepareDataForChart, setPrepareDataForChart] = useState(false);
  const [top1RankMap, setTop1RankMap] = useState(null);
  const [top10RankMap, setTop10RankMap] = useState(null);
  const [top5WinRateMap, setTop5WinRateMap] = useState(null);
  const [timeInFirstPlaceMap, setTimeInFirstPlaceMap] = useState(null);
  const [currSnapshot, setCurrSnapshot] = useState(1);
  const [startingSnapshot, setStartingSnapshot] = useState(1);
  const [playersWithErrors, setPlayersWithErrors] = useState([]);
  const [tabIndex, setTabIndex] = React.useState(0);
	const tabItemSx = toSx(tabItemStyles, tabClasses);
  const [tabLabel, setTabLabel] = useState("Settings");
  const [settings, setSettings] = useState(null);
  const [hideKeyPressed, setHideKeyPressed] = useState(false);
  const store = useStore();

  useEffect(() => {
    retrieveChartDataFromStore();
  }, [
    store.oneOnOneData,
    store.oneOnOneMaxSnapshotMap,
    store.oneOnOneSeasonSnapshotsMap,
    store.baseData,
    store.baseMaxSnapshotMap,
    store.baseSeasonSnapshotsMap
  ]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === "h") {
        setHideKeyPressed((prevState) => !prevState);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const retrieveChartDataFromStore = () => {
    setTimeout(() => {
      if (store.oneOnOneData && store.oneOnOneMaxSnapshotMap && store.oneOnOneSeasonSnapshotsMap && settings?.gameMode === '1v1') {
        setAllSeasonsData(store.oneOnOneData);
        setSeasonMaxSnapshotMap(store.oneOnOneMaxSnapshotMap);
        setSeasonSnapshotsMap(store.oneOnOneSeasonSnapshotsMap);
        setPrepareDataForChart(true);
      } else if (store.baseData && store.baseMaxSnapshotMap && store.baseSeasonSnapshotsMap && settings?.gameMode === 'Base') {
        setAllSeasonsData(store.baseData);
        setSeasonMaxSnapshotMap(store.baseMaxSnapshotMap);
        setSeasonSnapshotsMap(store.baseSeasonSnapshotsMap);
        setPrepareDataForChart(true);
      }
    }, 0);
  }


useEffect(() => {
  if (prepareDataForChart){
    let gameModeFormatted = settings.gameMode === '1v1' ? '1v1' : 'Base';
    if (settings?.lineChartMode === 0){
      generateTopPlayerLines(allSeasonsData, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, settings.season, settings.playerNum, settings.entering, settings.leaving, startingSnapshot, numOfTicksOnGraph, seasonMaxSnapshotMap, seasonSnapshotsMap[settings?.season].filter(s => s >= startingSnapshot));
      const {top10RankMap, top5WinRateMap, timeInFirstPlaceMap} = generateSnapshotMaps(allSeasonsData, settings.season, startingSnapshot);
      setTop1RankMap(Object.fromEntries(Object.entries(top10RankMap).map(([key, array]) => [key, array[0]])));
      setTop10RankMap(top10RankMap);
      setTop5WinRateMap(top5WinRateMap);
      setTimeInFirstPlaceMap(timeInFirstPlaceMap);
      setChartTitle(gameModeFormatted + " Season " + settings.season + " - Top " + settings.playerNum + " Players");
      setTabIndex(1);
      setGeneratingChart(false);
      setChartInitialized(true);
      setInErrorState(false);
      setPrepareDataForChart(false);
    } else if (settings?.lineChartMode === 1){
      let playersWithoutData = generateSelectedPlayerLines(allSeasonsData, seasonMaxSnapshotMap, seasonSnapshotsMap, numOfTicksOnGraph, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, settings, setStartingSnapshot);
      if (playersWithoutData?.length === 0){
        setPlayersWithErrors([]);
        const {top10RankMap, top5WinRateMap, timeInFirstPlaceMap} = generateSnapshotMapsForUsers(allSeasonsData, settings?.players, startingSnapshot);
        setTop1RankMap(Object.fromEntries(Object.entries(top10RankMap).map(([key, array]) => [key, array[0]])));
        setTop10RankMap(top10RankMap);
        setTop5WinRateMap(top5WinRateMap);
        setTimeInFirstPlaceMap(timeInFirstPlaceMap);
        setTabIndex(1);
        setChartTitle("Head to Head");
        setGeneratingChart(false);
        setChartInitialized(true);
        setPrepareDataForChart(false);
        setInErrorState(false);
      } else {
        setPlayersWithErrors(playersWithoutData);
        setGeneratingChart(false);
        setPrepareDataForChart(false);
        setInErrorState(true);
      }
    } else if (settings?.lineChartMode === 2){
      generateSeasonAverageLines(allSeasonsData, seasonMaxSnapshotMap, seasonSnapshotsMap, settings.playerNum, gameModeFormatted, numOfTicksOnGraph, setPlayerRatingMap, setTopPlayersAtTimeMap, setMinMap, setMaxMap, startingSnapshot);
      const {top10RankMap} = generateTopSeasonSnapshotMap(allSeasonsData, settings.playerNum);
      setTop10RankMap(top10RankMap);
      setTabIndex(1);
      setChartTitle(gameModeFormatted + " Season Average Rating - Top " + settings.playerNum + " Players");
      setGeneratingChart(false);
      setChartInitialized(true);
      setPrepareDataForChart(false);
      setInErrorState(false);
    }
  }
}, [prepareDataForChart]);

useEffect(() => {
  if (settings != null && !generatingChart){
    setGeneratingChart(true);
    setMinMap(null);
    setMaxMap(null);
    setSeasonMaxSnapshotMap(null);
    setSeasonSnapshotsMap(null);
    setPlayerRatingMap(null);
    setTopPlayersAtTimeMap(null);
    setTop1RankMap(null);
    setTop10RankMap(null);
    setTop5WinRateMap(null);
    setTimeInFirstPlaceMap(null);
    setCurrSnapshot(settings.startingSnapshot);
    setStartingSnapshot(settings.startingSnapshot);


    if (settings.gameMode === '1v1'){
      if (store.oneOnOneData){
        retrieveChartDataFromStore();
      } else {
        store.loadOneOnOneData();
      }
    } else {
      if (store.baseData){
        retrieveChartDataFromStore();
      } else {
        store.loadBaseData();
      }
    }
  }
}, [settings]);

useEffect(() => {
  const handleTickEvent = (e) => {
    const { snapshot } = e.detail;
    setCurrSnapshot(snapshot);
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
        {
          ( (allSeasonsData && !generatingChart && !inErrorState)) && <LineChart playerData={playerRatingMap} topPlayersAtTimeMap={topPlayersAtTimeMap} 
          minMap={minMap} maxMap={maxMap} numOfTicksOnGraph={numOfTicksOnGraph} lineChartSpeed={settings?.speed ? lineChartSpeed/settings.speed : lineChartSpeed} 
          generatingChart={generatingChart} seasonSnapshots={ settings?.lineChartMode !== 0 ? Array.from({ length: (186-startingSnapshot) }, (_, i) => i + startingSnapshot) : seasonSnapshotsMap[settings?.season].filter(s => s >= startingSnapshot)} chartTitle={chartTitle}/> 
        }
        <div className={`${allSeasonsData === null || generatingChart || inErrorState ? 'fullContainer' : 'supportingContentContainer'}`}>
          {
            !hideKeyPressed && <div className='tabModule'>
            <Tabs
                value={tabIndex}
                onChange={(e, index) => {setTabIndex(index); setTabLabel(e.target.textContent);}}
                sx={toSx(tabsStyles, tabsClasses)}
              >
                <Tab disableRipple label={"Settings"} sx={tabItemSx} />
                <Tab disableRipple label={"Leaderboards"} sx={tabItemSx} disabled={settings === null}/>
						</Tabs>
          </div>
          }
          
              <Settings hide={tabIndex !== 0} playersWithoutData={playersWithErrors}/>
              <Backdrop open={generatingChart}>
                <Loader/>
              </Backdrop>
              {
                tabIndex !== 0 && <div className='supportingVisContainer'>
                { 
                  settings?.lineChartMode !== 2 && <div className='leaderboardItem leadingUserModule'>
                  <LeadingUser data={top1RankMap} currSnapshot={currSnapshot}/>
                </div>
                }
              <div className='leaderboardItem leaderboardItem1'>
                <LeaderBoard title="Top Rating" data={top10RankMap} leaderBoardMetric="skillRating" size={settings?.lineChartMode !== 0 ? 8 : 10} currSnapshot={currSnapshot} subValueType={settings?.lineChartMode === 1 ? 'seasonRank' : settings?.lineChartMode === 2 ? 'winRate' : ''}/>
              </div>
              { 
                settings?.lineChartMode !== 2 && <>
                  <div className='leaderboardItem leaderboardItem2'>
                    <LeaderBoard title="Top Win Rate" data={top5WinRateMap} leaderBoardMetric="winRate" size={5} currSnapshot={currSnapshot} subValueType={'gamesPlayed'}/>
                  </div>
    
                  <div className='leaderboardItem leaderboardItem3'>
                    <LeaderBoard title="Time in First" data={timeInFirstPlaceMap} leaderBoardMetric="daysInFirst" size={3} currSnapshot={currSnapshot}/>
                  </div>
                </>
              }
            </div>
              }
          
          </div>
    </div>
  );
};

export default observer(Home);
