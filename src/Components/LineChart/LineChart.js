import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineChart = ({ playerData, topPlayersAtTimeMap, minMap, maxMap, numOfTicksOnGraph, lineChartSpeed }) => {
  const [graphInitialized, setGraphInitialized] = useState(false);
  const coreVisRef = useRef(null); // Ref to target coreVisContainer div
  const pathsRef = useRef({}); // Object to keep track of active paths by username
  const labelsRef = useRef({}); // Object to keep track of label elements
  const playerStartIndexRef = useRef({}); // Object to store start index for each player
  const colorUsage = useRef({}); // Object to track color usage counts

  useEffect(() => {
    if (!graphInitialized && playerData && Object.values(playerData).length > 0 && minMap && maxMap) {
      setGraphInitialized(true);

      d3.select(coreVisRef.current).select('svg').remove();
      let margin = 0;
      let h = 0;
      let w = 0;

      // Set dimensions and margins for the chart
      if (window.innerWidth < 800){
        margin = {top: 20, right: 100, bottom: 40, left: 60};
        h = window.innerHeight / 1.5 - margin.top - margin.bottom;
        w = window.innerWidth/1.1 - margin.left - margin.right;
      } else if (window.innerWidth >= 800 && window.innerWidth <= 1200){
        margin = {top: 20, right: 100, bottom: 40, left: 60};
        h = window.innerHeight / 2 - margin.top - margin.bottom;
        w = window.innerWidth/2 - margin.left - margin.right;
      } else {
        margin = { top: 20, right: 100, bottom: 40, left: 60 };
        h = window.innerHeight / 1.2 - margin.top - margin.bottom;
        w = window.innerWidth / 2.5 - margin.left - margin.right;
      }

      let time = 0;
      let num = numOfTicksOnGraph; // Number of points to display at any given time
      let timeMax = Object.keys(topPlayersAtTimeMap).length;

      // Create scales
      let x = d3.scaleLinear().range([0, w]);
      let y = d3.scaleLinear().range([h, 0]);

      // Create axes
      let xAxis = d3.axisBottom(x)
        .tickSizeInner(-h)
        .tickSizeOuter(0)
        .tickPadding(10)
        .ticks(4) 
        .tickFormat(d => `Day ${5 + (d / 50)}`);// Set tick interval to 30 increments

      let yAxis = d3.axisLeft(y)
        .tickSizeInner(-w)
        .tickSizeOuter(0)
        .tickPadding(10);

      // Create SVG container in the coreVisContainer div
      let svg = d3.select(coreVisRef.current).append('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Lighten grid line color
    svg.selectAll('.tick line')
      .style('stroke', '#cccccc'); // Light gray grid lines

    // Add x-axis label
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', w / 2)
      .attr('y', h + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Day # in Season');

      // Append x and y axes
      let $xAxis = svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${h})`)
        .call(xAxis);

      let $yAxis = svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

      // Define colors for lines
      const myColor = [
        '#e50000', '#fb9031', '#11e928', '#ba3ee1', '#d1d3d1', '#059bfb', '#747678', '#ffe001',
        '#a0f2ed', '#dbc5f8', '#219b42', '#e36728', '#8cb60c', '#e1b568'
      ];

      // Initialize color usage counts
      myColor.forEach(color => {
        colorUsage.current[color] = 0;
      });

      let activePlayers = [];

      function getStartIndexForPlayer(username) {
        if (playerStartIndexRef.current[username] !== undefined) {
          return playerStartIndexRef.current[username];
        }
        playerStartIndexRef.current[username] = time; 
        return time;
      }

      function getLeastUsedColor() {
        return Object.entries(colorUsage.current).reduce((leastUsedColor, [color, count]) => {
          if (leastUsedColor === null || count < colorUsage.current[leastUsedColor]) {
            return color;
          }
          return leastUsedColor;
        }, null);
      }
      function update() {
        activePlayers = [...topPlayersAtTimeMap[time]];

        activePlayers.forEach((username, index) => {
          if (!pathsRef.current[username]) {
            const color = getLeastUsedColor();
            colorUsage.current[color]++;

            pathsRef.current[username] = svg.append('path')
              .attr('class', `line data line-${index}`)
              .style('stroke', color)
              .style('fill', 'none');

            labelsRef.current[username] = svg.append('text')
              .attr('class', `line-label label-${index}`)
              .style('fill', color)
              .style('font-size', '12px');
          }

          const startIndex = getStartIndexForPlayer(username);
          const adjustedLine = d3.line()
            .defined(d => d !== -1)
            .x((d, i) => x(Math.max(time - num, startIndex) + i))
            .y(d => y(d))
            .curve(d3.curveBasis);
        
          const lineData = playerData[username].slice(Math.max(startIndex, time - num), time + 1);
          pathsRef.current[username]
            .datum(lineData)
            .attr('d', adjustedLine);

          const currentDataPoint = playerData[username][time];
          const opacity = (currentDataPoint !== undefined && currentDataPoint !== -1) ? 1 : 0.25;
          pathsRef.current[username].style('opacity', opacity);

          const lastIndex = lineData.length - 1;
          if (lineData[lastIndex] !== undefined) {
            labelsRef.current[username]
              .text(username)
              .attr('x', x(Math.max(time - num, startIndex) + lastIndex))
              .attr('y', y(lineData[lastIndex]))
              .attr('dx', 5)
              .attr('dy', 4);
          }
        });

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
          if (!activePlayers.includes(username)) {
            delete playerStartIndexRef.current[username];
          }
        });

        x.domain([Math.max(time - num + 1, 0), Math.max(time + 1, numOfTicksOnGraph)]);
        y.domain([minMap[time] - 0, maxMap[time] + 10]);

        $xAxis.call(xAxis);
        $yAxis.call(yAxis);
      }

      const dispatchNextSnapshotEvent = () => {
        const event = new CustomEvent("nextSnapshot", { detail: { snapshot: Math.floor(time/25)} });
        window.dispatchEvent(event);
      };

      let lastTickTime = 0;

function tick(timestamp) {
  console.log('tick')
  // Check if this is the first frame or enough time has passed since the last tick
  if (timestamp - lastTickTime >= lineChartSpeed) {
    console.log("AHHHHHHHHHHh");
    lastTickTime = timestamp; // Update the last tick time
    if (time % 25 === 0){
      dispatchNextSnapshotEvent();
    }
    // Run the tick logic here
    time++;
    update();

    // Stop the animation if the maximum time has been reached
    if (time >= timeMax) return;
  }

  // Continue the animation loop
  requestAnimationFrame(tick);
}

// Start the animation loop
requestAnimationFrame(tick);
    }
  }, [graphInitialized, playerData, topPlayersAtTimeMap, minMap, maxMap]);

  return <div ref={coreVisRef} className='coreVisContainer'></div>;
};

export default LineChart;
