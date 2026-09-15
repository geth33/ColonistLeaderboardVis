import React, { useState, useEffect, useRef } from 'react';
import './ColonistHallOfFame.css';
import constants from '../utils/constants';
import GameModeOption from '../Components/ColonistLeaderboard/GameModeOption';
import HallOfFameLeaderboard from '../Components/HallOfFame/HallOfFameLeaderboard';
import PeakEloChart from '../Components/HallOfFame/PeakEloChart';
import { useStore } from '../Store/storeProvider';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import {
  Button,
  IconButton,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function StageIntro({ titleText = "" }) {
  const [titleVisible, setTitleVisible] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [activeGameMode, setActiveGameMode] = useState("1v1");
  const [finishBracketIndex, setFinishBracketIndex] = useState(0);
  const [finishBracketOptions, setFinishBracketOptions] = useState(['Rank 1', 'Top 5', 'Top 10', 'Top 100']);
  const [timeInBracketIndex, setTimeInBracketIndex] = useState(0);
  const [timeInBracketOptions, setTimeInBracketOptions] = useState(['First', 'Top 5', 'Top 10', 'Top 100']);
  const [winRateBracketIndex, setWinRateBracketIndex] = useState(0);
  const [winRateBracketOptions, setWinRateBracketOptions] = useState(['(75+ Games)', '(100+ Games)', '(200+ Games)', '(500+ Games)']);


  
  // Track visibility states for rows 2, 3, and 4
  const [row2Visible, setRow2Visible] = useState(false);
  const [row3Visible, setRow3Visible] = useState(false);
  const [row4Visible, setRow4Visible] = useState(false);

  const store = useStore();

  const { testHallOfFameLeaderboard } = constants;

  const stageRef = useRef(null);

  // Refs for scroll observer targets
  const row2Ref = useRef(null);
  const row3Ref = useRef(null);
  const row4Ref = useRef(null);

  // Dynamic timing refs to control rate changes without component re-renders
  const titleFlashFreqRef = useRef(225);
  const leftFlashFreqRef = useRef(333);   // ~3 flashes per second
  const rightFlashFreqRef = useRef(333);  // ~3 flashes per second

  // Array to generate stacked tiles down the page borders
  const tileArray = Array.from({ length: 10 });

  useEffect(() => {
    store.loadOneOnOneHallOfFameData();
  }, []);

  useEffect(() => {
      retrieveChartDataFromStore();
    }, [
      store.oneOnOneFinishesTop1,
      store.oneOnOneFinishesTop5,
      store.oneOnOneFinishesTop10,
      store.oneOnOneFinishesTop100,
      store.oneOnOnePeakSkillRatings
    ]);
  
    const retrieveChartDataFromStore = () => {
      setTimeout(() => {
        
      }, 0);
    }

  // 1. Scroll Observer for Rows 2-4
  useEffect(() => {
    const observerOptions = {
      root: null, // Default viewport
      rootMargin: '0px 0px -50px 0px', // Triggers slightly before reaching bottom
      threshold: 0.15 // Triggers when 15% of row is visible
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === row2Ref.current) setRow2Visible(true);
          if (entry.target === row3Ref.current) setRow3Visible(true);
          if (entry.target === row4Ref.current) setRow4Visible(true);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (row2Ref.current) observer.observe(row2Ref.current);
    if (row3Ref.current) observer.observe(row3Ref.current);
    if (row4Ref.current) observer.observe(row4Ref.current);

    return () => observer.disconnect();
  }, [titleVisible]);

  // 2. Camera Flares and Initial Timers
  useEffect(() => {
    let titleTimeoutId;
    let leftTimeoutId;
    let rightTimeoutId;

    const spawnFlare = (x, y) => {
      const flash = document.createElement('div');
      flash.className = 'lens-flare-assembly';
      flash.style.left = `${x}px`;
      flash.style.top = `${y}px`;

      flash.innerHTML = `
        <div class="flare-core"></div>
        <div class="flare-streak-h"></div>
        <div class="flare-streak-v"></div>
      `;

      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 500);
    };

    // 1. Title Perimeter Flashes
    const triggerPerimeterFlash = () => {
      if (!stageRef.current) return;

      const rect = stageRef.current.getBoundingClientRect();
      const padding = 20;
      const side = Math.floor(Math.random() * 4);
      let x, y;

      switch (side) {
        case 0: // Top
          x = rect.left - padding + Math.random() * (rect.width + padding * 2);
          y = rect.top - padding;
          break;
        case 1: // Right
          x = rect.right + padding;
          y = rect.top - padding + Math.random() * (rect.height + padding * 2);
          break;
        case 2: // Bottom
          x = rect.left - padding + Math.random() * (rect.width + padding * 2);
          y = rect.bottom + padding;
          break;
        case 3: // Left
          x = rect.left - padding;
          y = rect.top - padding + Math.random() * (rect.height + padding * 2);
          break;
        default:
          x = rect.left;
          y = rect.top;
      }

      spawnFlare(x, y);
    };

    // 2. Left Paparazzi Flashes
    const triggerLeftPaparazziFlash = () => {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      const x = Math.random() * (winWidth * 0.15);
      const y = (winHeight * 0.35) + Math.random() * (winHeight * 0.65);

      spawnFlare(x, y);
    };

    // 3. Right Paparazzi Flashes
    const triggerRightPaparazziFlash = () => {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      const x = (winWidth * 0.85) + Math.random() * (winWidth * 0.10);
      const y = (winHeight * 0.35) + Math.random() * (winHeight * 0.65);

      spawnFlare(x, y);
    };

    const titleFlashLoop = () => {
      triggerPerimeterFlash();
      titleTimeoutId = setTimeout(titleFlashLoop, titleFlashFreqRef.current);
    };

    const leftFlashLoop = () => {
      triggerLeftPaparazziFlash();
      leftTimeoutId = setTimeout(leftFlashLoop, leftFlashFreqRef.current);
    };

    const rightFlashLoop = () => {
      triggerRightPaparazziFlash();
      rightTimeoutId = setTimeout(rightFlashLoop, rightFlashFreqRef.current);
    };

    titleFlashLoop();

    const transitionTimer = setTimeout(() => {
      setTitleVisible(true);
      setIsDimmed(true);

      titleFlashFreqRef.current = 8000;

      leftFlashFreqRef.current = 333;
      rightFlashFreqRef.current = 333;
      leftFlashLoop();
      rightFlashLoop();

      const slowPaparazziTimer = setTimeout(() => {
        leftFlashFreqRef.current = 1700;
        rightFlashFreqRef.current = 2000;
      }, 2000);

      return () => clearTimeout(slowPaparazziTimer);
    }, 2000);

    return () => {
      clearTimeout(titleTimeoutId);
      clearTimeout(leftTimeoutId);
      clearTimeout(rightTimeoutId);
      clearTimeout(transitionTimer);
    };
  }, []);

  return (
    <div className="stage-wrapper">

      {/* Left Paparazzi Strip */}
      <div className={`paparazzi-border paparazzi-left ${titleVisible ? 'visible' : ''}`}>
        {tileArray.map((_, index) => (
          <img
            key={`pap-left-${index}`}
            src="/img/paparazzi.png"
            alt="Paparazzi"
            className="paparazzi-tile"
          />
        ))}
      </div>

      {/* Right Paparazzi Strip */}
      <div className={`paparazzi-border paparazzi-right ${titleVisible ? 'visible' : ''}`}>
        {tileArray.map((_, index) => (
          <img
            key={`pap-right-${index}`}
            src="/img/paparazzi.png"
            alt="Paparazzi"
            className="paparazzi-tile"
          />
        ))}
      </div>

      {/* Top Hanging Stage Lights */}
      <div className={`top-light top-light-left ${titleVisible ? 'visible' : ''}`} />
      <div className={`top-light top-light-right ${titleVisible ? 'visible' : ''}`} />

      {/* Stage Lights */}
      <div className={`light-cone light-left ${isDimmed ? 'dimmed' : ''}`} />
      <div className={`light-cone light-right ${isDimmed ? 'dimmed' : ''}`} />

      {/* Title Target Container */}
      <div className="title-stage">

        {/* 1. Main Title */}
        <h1 className={`main-title ${titleVisible ? 'visible' : ''}`} ref={stageRef}>
          Hall of Fame
        </h1>

        {/* 2. Limousine */}
        <div className={`limo-position-wrapper ${titleVisible ? 'visible' : ''}`}>
          <div className="limo-container"></div>
        </div>

        <div className={`redCarpet-position-wrapper ${titleVisible ? 'visible' : ''}`}>
          <div className="redCarpet-container"></div>
        </div>

        {/* 3. Subtitle */}
        <h2 className={`subtitle ${titleVisible ? 'visible' : ''}`}>
          -- Colonist Leaderboards --
        </h2>

        <div className='mode-selector-container'>
          <div className={`colonistHallOfFame ${titleVisible ? 'visible' : ''}`}>
            <GameModeOption img="/img/1v1.png" title="1v1" active={activeGameMode === '1v1'} setActiveGameMode={setActiveGameMode} displayBackground={true}/>
            <GameModeOption img="/img/4player.png" title="4P" active={activeGameMode === '4P'} setActiveGameMode={setActiveGameMode} displayBackground={true}/>
          </div>
        </div>

        <div className={`leaderboardRows ${titleVisible ? 'visible' : ''}`}>
          {/* Row 1 reveals automatically with the main transition */}
          <div className='leaderboardRow leaderboardsRow1'>
            <div className='leaderboardModule'>
              <div className='leaderboardTitle'>
                <h3>Highest Ratings</h3>
              </div>
              <HallOfFameLeaderboard leaderboardEntries={store && store.oneOnOnePeakSkillRatings ? store.oneOnOnePeakSkillRatings : testHallOfFameLeaderboard} property={'skillRating'}/>
            </div>
            <div className='leaderboardModule'>
              <div className='leaderboardTitle'>
                <h3><span>{finishBracketOptions[finishBracketIndex]}</span> Finishes</h3>
                <div style={{display:'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <IconButton color="inherit" edge="end" className="compact-icon-button" onClick={() => {setFinishBracketIndex(finishBracketIndex - 1 >= 0 ? finishBracketIndex - 1 : 0)}}>
                    <KeyboardArrowUpIcon />
                  </IconButton>
                  <IconButton color="inherit" edge="end" className="compact-icon-button" onClick={() => {setFinishBracketIndex(finishBracketIndex + 1 <= 3 ? finishBracketIndex + 1 : 3)}}>
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </div>
              </div>
              <HallOfFameLeaderboard leaderboardEntries={store && store.oneOnOneFinishes && store.oneOnOneFinishes.length > 0 ? store.oneOnOneFinishes[finishBracketIndex] : testHallOfFameLeaderboard} property={'appearances'}/>
            </div>            
          </div>

          <div ref={row2Ref} className={`leaderboardRow leaderboardsRow2 scroll-reveal ${row2Visible ? 'revealed' : ''}`}>
            <div className='leaderboardTitle'>
              <h3 className='hallOfFameLeaderboardTitle'>Rating Record Over Time</h3>
            </div>
            <PeakEloChart/>
          </div>

          <div ref={row3Ref} className={`leaderboardRow leaderboardsRow3 scroll-reveal ${row3Visible ? 'revealed' : ''}`}>
            <div className='leaderboardModule'>
              <div className='leaderboardTitle'>
                <h3><span>DAYS IN {timeInBracketOptions[timeInBracketIndex]}</span></h3>
                <div style={{display:'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <IconButton color="inherit" edge="end" className="compact-icon-button" onClick={() => {setTimeInBracketIndex(timeInBracketIndex - 1 >= 0 ? timeInBracketIndex - 1 : 0)}}>
                    <KeyboardArrowUpIcon />
                  </IconButton>
                  <IconButton color="inherit" edge="end" className="compact-icon-button" onClick={() => {setTimeInBracketIndex(timeInBracketIndex + 1 <= 3 ? timeInBracketIndex + 1 : 3)}}>
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </div>
              </div>
              <HallOfFameLeaderboard  leaderboardEntries={store && store.oneOnOneTimeIn && store.oneOnOneTimeIn.length > 0 ? store.oneOnOneTimeIn[timeInBracketIndex] : testHallOfFameLeaderboard} property={'days'}/>
            </div>
            <div className='leaderboardModule'>
              <div className='leaderboardTitle'>
                  <h3>TOP Win Rates</h3>
                <div style={{display:'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <IconButton color="inherit" edge="end" className="compact-icon-button" onClick={() => {setWinRateBracketIndex(winRateBracketIndex - 1 >= 0 ? winRateBracketIndex - 1 : 0)}}>
                    <KeyboardArrowUpIcon />
                  </IconButton>
                  <IconButton color="inherit" edge="end" className="compact-icon-button" onClick={() => {setWinRateBracketIndex(winRateBracketIndex + 1 <= 3 ? winRateBracketIndex + 1 : 3)}}>
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'center', fontSize: '1.2rem'}}>
                <span>{winRateBracketOptions[winRateBracketIndex]}</span>
              </div>

              <HallOfFameLeaderboard  leaderboardEntries={store && store.oneOnOneWinRates && store.oneOnOneWinRates.length > 0 ? store.oneOnOneWinRates[winRateBracketIndex] : testHallOfFameLeaderboard} property={'winRate'}/>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}