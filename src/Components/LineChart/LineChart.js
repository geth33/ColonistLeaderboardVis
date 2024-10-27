import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineChart = ({ playerData, topPlayersAtTimeMap, minMap, maxMap }) => {
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

      // Set dimensions and margins for the chart
      const margin = { top: 20, right: 60, bottom: 40, left: 60 };
      const h = window.innerHeight / 1.2 - margin.top - margin.bottom;
      const w = window.innerWidth / 2.5 - margin.left - margin.right;

      let time = 0;
      let num = 200; // Number of points to display at any given time
      let timeMax = Object.keys(topPlayersAtTimeMap).length;

      // Create scales
      let x = d3.scaleLinear().range([0, w]);
      let y = d3.scaleLinear().range([h, 0]);

      // Create axes
      let xAxis = d3.axisBottom(x)
        .tickSizeInner(-h)
        .tickSizeOuter(0)
        .tickPadding(10);

      let yAxis = d3.axisLeft(y)
        .tickSizeInner(-w)
        .tickSizeOuter(0)
        .tickPadding(10);

      // Create line generator with segmented paths
      const line = d3.line()
        .defined(d => d !== -1) // Ignore points where rating is -1
        .x((d, i) => x(Math.max(time - num, 0) + i + 1)) // Adjust to move the x-axis dynamically
        .y(d => y(d))
        .curve(d3.curveBasis);

      // Create SVG container in the coreVisContainer div
      let svg = d3.select(coreVisRef.current).append('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

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

        x.domain([Math.max(time - num + 1, 0), Math.max(time + 1, 200)]);
        y.domain([minMap[time] - 0, maxMap[time] + 10]);

        $xAxis.transition().duration(15).call(xAxis);
        $yAxis.transition().duration(15).call(yAxis);
      }

      function tick() {
        if (time < timeMax) {
          time++;
          update();
        }
      }

      const intervalId = setInterval(() => {
        tick();
        if (time >= timeMax -1) {
          clearInterval(intervalId);
        }
      }, 25);
    }
  }, [graphInitialized, playerData, topPlayersAtTimeMap, minMap, maxMap]);

  return <div ref={coreVisRef} className='coreVisContainer'></div>;
};

export default LineChart;
