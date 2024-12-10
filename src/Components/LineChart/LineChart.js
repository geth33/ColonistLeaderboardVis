import React, { useEffect, useRef, useState } from 'react';
import './LineChart.css';
import * as d3 from 'd3';

const MARGIN = { top: 40, right: 120, bottom: 50, left: 60 };
const COLORS = [
  '#e50000', '#fb9031', '#11e928', '#ba3ee1', '#d1d3d1', '#059bfb', '#747678',
  '#ffe001', '#a0f2ed', '#dbc5f8', '#219b42', '#e36728', '#8cb60c', '#e1b568'
];

const COLORS2 = [
  '#E5BD75', // Adjusted complementary for Gold
  '#AF67EE', '#51EE68', // Bright Purple and its Green complement
  '#A893E2', '#70E27A', // Slightly brightened complementary Lime Green
  '#65CFDE', '#E0744A', // Cyan and its complementary bright Orange
  '#83E79F', '#E09742', // Green and its complementary brighter Orange
  '#DAE075', '#7580E0', // Yellow and its complementary Blue
  '#D9968F', '#8FD9C8', // Peach and Teal (visible contrast)
  '#E39B8D', '#8DE3E4', // Coral and Light Cyan
  '#D9DC9C', '#9C9CD9', // Light Green and Light Purple
  '#B296A8', '#A8B2A0', // Mauve and slightly brightened Sage Green
];


const LineChart = ({ playerData, topPlayersAtTimeMap, minMap, maxMap, numOfTicksOnGraph, lineChartSpeed, generatingChart, seasonSnapshots, chartTitle}) => {

  const [graphInitialized, setGraphInitialized] = useState(false);
  const coreVisRef = useRef(null);
  const pathsRef = useRef({});
  const labelsRef = useRef({});
  const savedTimeRef = useRef(0);
  const playerStartIndexRef = useRef({});
  const colorUsage = useRef({});
  let requestId = useRef(null); // Reference for requestAnimationFrame ID
  const resizeTimeout = useRef(null); // Ref to store the resize timeout ID

  useEffect(() => {
    const handleResize = () => {
      // Clear any existing timeout
      clearTimeout(resizeTimeout.current);

      // Set a new timeout to reset and reinitialize the chart
      resizeTimeout.current = setTimeout(() => {
        if (graphInitialized) {
          resetChart();
          initializeChart();
        }
      }, 800); // Adjust the debounce time as needed (e.g., 300ms)
    };

    // Attach the resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener and timeout on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout.current); // Clear timeout when the component unmounts
    };
  }, [graphInitialized]);

  useEffect(() => {
    if (!graphInitialized && playerData && Object.values(playerData).length > 0 && minMap && maxMap) {
      initializeChart();
    }
  }, [graphInitialized, playerData, topPlayersAtTimeMap, minMap, maxMap]);

  const initializeChart = () => {
    setGraphInitialized(true);

    const dimensions = calculateDimensions();
    const svg = setupChart(dimensions);
    const { x, y, xAxis, yAxis, $xAxis, $yAxis } = setupScalesAndAxes(svg, dimensions);

    initializeColorUsage();

    let time = savedTimeRef.current;
    let lastTickTime = savedTimeRef.current;
    const timeMax = Object.keys(topPlayersAtTimeMap).length;

    const tick = (timestamp) => {
      if (timestamp - lastTickTime >= lineChartSpeed) {
        lastTickTime = timestamp;
        time++;
        if (time < timeMax) {
          update(svg, x, y, xAxis, yAxis, $xAxis, $yAxis, dimensions, time, timeMax);
        }
        if (time % 25 === 0) dispatchSnapshotEvent(time);
      }
      if (time < timeMax) {
        requestId.current = requestAnimationFrame(tick);
      }
    };

    requestId.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (generatingChart){
      resetChart();
    }
    return () => {
      resetChart();    
    };
  }, [generatingChart]);

  const resetChart = () => {
    setGraphInitialized(false);
    d3.select(coreVisRef.current).select('svg').remove();
    if (requestId.current) cancelAnimationFrame(requestId.current);
    pathsRef.current = {};
    labelsRef.current = {};
    playerStartIndexRef.current = {};
    colorUsage.current = {};    
  }

  // Utility to calculate dimensions based on window size
  const calculateDimensions = () => {
    const width = window.innerWidth < 1100 ? window.innerWidth / 1.1 : window.innerWidth / 2.2;
    const height = window.innerWidth < 1100 ? window.innerHeight / 1.5 : window.innerHeight / 1.2;
    return { width: width - MARGIN.left - MARGIN.right, height: height - MARGIN.top - MARGIN.bottom };
  };

  // Setup SVG container and axis labels
  const setupChart = ({ width, height }) => {
    d3.select(coreVisRef.current).select('svg').remove();
    const svg = d3.select(coreVisRef.current).append('svg')
      .attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', height + MARGIN.top + MARGIN.bottom)
      .append('g')
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', width / 2)
      .attr('y', height + MARGIN.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Day # in Season');
      // Y axis label:
      svg.append("text")
      .attr('class', 'y-axis-label')
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -44)
      .attr("x", -height/2)
      .style('font-size', '14px')
      .text("Rating")
      // Title
      svg.append('text')
      .attr('class', 'title')
      .attr('y', -10)
      .attr('x', width / 2)
      .attr("text-anchor", "middle")
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(chartTitle);
    return svg;
  };

  // Setup scales and axes
  const setupScalesAndAxes = (svg, { width, height }) => {
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x).tickSizeInner(-height).tickPadding(10).ticks(4)
      .tickFormat(d => `Day ${seasonSnapshots[Math.floor(d / 25)]/2}`);
    const yAxis = d3.axisLeft(y).tickSizeInner(-width).tickPadding(10);

    const $xAxis = svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${height})`).call(xAxis);
    const $yAxis = svg.append('g').attr('class', 'y-axis').call(yAxis);

    svg.selectAll('.tick line').style('stroke', '#cccccc'); // Light gray grid lines

    return { x, y, xAxis, yAxis, $xAxis, $yAxis };
  };

  const initializeColorUsage = () => {
    COLORS2.forEach(color => colorUsage.current[color] = 0);
  };

  const dispatchSnapshotEvent = (time) => {
    savedTimeRef.current = time;
    const event = new CustomEvent("nextSnapshot", { detail: { snapshot: seasonSnapshots[Math.floor(time / 25)] } });
    window.dispatchEvent(event);
  };

  // Main update function
  const update = (svg, x, y, xAxis, yAxis, $xAxis, $yAxis, dimensions, time, timeMax) => {
    const activePlayers = [...topPlayersAtTimeMap[time]];

    activePlayers.forEach((username, index) => {
      if (!pathsRef.current[username]) createPlayerElements(svg, username, index);

      const startIndex = getStartIndexForPlayer(username, time);
      const lineData = playerData[username].slice(Math.max(startIndex, time - numOfTicksOnGraph), time + 1);

      updatePlayerPath(username, lineData, time, timeMax, x, y, startIndex);
      updatePlayerLabel(username, lineData, x, y, time, startIndex);
    });

    cleanupInactivePlayers(activePlayers);
    updateScales(x, y, xAxis, yAxis, $xAxis, $yAxis, time);
  };

  const createPlayerElements = (svg, username, index) => {
    const color = getLeastUsedColor();
    colorUsage.current[color]++;
    pathsRef.current[username] = svg.append('path')
      .attr('class', `line data line-${index}`)
      .style('stroke', color)
      .style('fill', 'none')
      .style('stroke-width', '2');
    labelsRef.current[username] = svg.append('text')
      .attr('class', `line-label label-${index}`)
      .style('fill', color)
      .style('font-size', '12px')
      .style('font-weight', 'bold');
  };

  const getStartIndexForPlayer = (username, time) => {
    if (playerStartIndexRef.current[username] === undefined) {
      playerStartIndexRef.current[username] = time;
    }
    return playerStartIndexRef.current[username];
  };

  const getLeastUsedColor = () => {
    return Object.entries(colorUsage.current).reduce((leastUsed, [color, count]) =>
      !leastUsed || count < colorUsage.current[leastUsed] ? color : leastUsed, null
    );
  };

  const updatePlayerPath = (username, lineData, time, timeMax, x, y, startIndex) => {
    const pathGenerator = d3.line()
      .defined(d => d !== -1)
      .x((d, i) => x(Math.max(time - numOfTicksOnGraph, startIndex) + i))
      .y(d => y(d))
      .curve(d3.curveBasis);
  
    // Set path data
    pathsRef.current[username].datum(lineData).attr('d', pathGenerator);
  
    // Set opacity based on the current data point
    const currentDataPoint = playerData[username][time];
    const opacity = ((currentDataPoint !== undefined && currentDataPoint !== -1) || time === timeMax) ? 1 : 0.25;
    pathsRef.current[username].style('opacity', opacity);
  };
  

  const updatePlayerLabel = (username, lineData, x, y, time, startIndex) => {
    const lastIndex = lineData.length - 1;
    if (lineData[lastIndex] !== undefined) {
      labelsRef.current[username]
        .text(username)
        .attr('x', x(Math.max(time - numOfTicksOnGraph, startIndex) + lastIndex))
        .attr('y', y(lineData[lastIndex]))
        .attr('dx', 5)
        .attr('dy', 4);
    }
  };

  const cleanupInactivePlayers = (activePlayers) => {
    Object.keys(pathsRef.current).forEach(username => {
      if (!activePlayers.includes(username)) {
        const color = pathsRef.current[username].style('stroke');
        colorUsage.current[color]--;
        pathsRef.current[username].remove();
        delete pathsRef.current[username];
        labelsRef.current[username].remove();
        delete labelsRef.current[username];
      }
    });
    Object.keys(playerStartIndexRef.current).forEach(username => {
      if (!activePlayers.includes(username)) delete playerStartIndexRef.current[username];
    });
  };

  const updateScales = (x, y, xAxis, yAxis, $xAxis, $yAxis, time) => {
    x.domain([Math.max(time - numOfTicksOnGraph + 1, 0), Math.max(time + 1, numOfTicksOnGraph)]);
    y.domain([minMap[time] - 0, maxMap[time] + 10]);
    $xAxis.call(xAxis);
    $yAxis.call(yAxis);
  };

  return <div ref={coreVisRef} className='coreVisContainer'></div>;
};

export default LineChart;
