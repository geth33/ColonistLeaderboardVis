import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineChart = () => {
  const [graphInitialized, setGraphInitialized] = useState(false);
  const coreVisRef = useRef(null); // Ref to target coreVisContainer div

  useEffect(() => {
    if (!graphInitialized) {
      setGraphInitialized(true);

      d3.select(coreVisRef.current).select('svg').remove();

      // Set dimensions and margins for the chart
      const margin = { top: 20, right: 60, bottom: 40, left: 60 };
      const h = window.innerHeight / 1.2 - margin.top - margin.bottom;
      const w = window.innerWidth / 2.5 - margin.left - margin.right;

      let time = 0;
      let num = 200; // Number of points to display at any given time

      let allData = [];  // Array to hold all 20 lines data
      let numLines = 20;  // Total number of lines to generate

      // Array of human names for each line
      const names = [
        'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah', 'Ivan', 'Julia',
        'Kevin', 'Laura', 'Michael', 'Nina', 'Oscar', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tina'
      ];

      // Function to generate the detailed data for each line
      function generateLineData(startValue) {
        let newData = [];
        newData.push(startValue);  // Add the initial value to the array

        // Generate initial 100 random data points
        for (let i = 1; i < 100; i++) {  // Loop to generate 99 more data points
          let randomChange = Math.floor(Math.random() * 41) - 20; // Generate a random number between -20 and 20
          let nextValue = newData[i - 1] + randomChange;  // Calculate the next data point
          newData.push(nextValue);  // Add the next data point to the array
        }

        // Create the new array with 10,000 data points using linear interpolation
        let detailedData = [];

        // Generate the detailed data with 100 points between each pair in newData
        for (let i = 0; i < newData.length - 1; i++) {
          let startValue = newData[i];
          let endValue = newData[i + 1];
          let step = (endValue - startValue) / 50;  // Calculate the step size for linear interpolation

          // Add 100 linearly interpolated points between startValue and endValue
          for (let j = 0; j < 50; j++) {
            detailedData.push(startValue + step * j);  // Add the interpolated value to the array
          }
        }

        // Add the last point to complete the array
        detailedData.push(newData[newData.length - 1]);

        return detailedData;
      }

      // Generate data for 20 lines
      for (let i = 0; i < numLines; i++) {
        let startValue = 1500 + Math.random() * 300;  // Random start value between 1500 and 1800
        allData.push(generateLineData(startValue));
      }

      // Initialize necessary variables for D3
      let deltas = allData.map(lineData => [lineData[0]]);
      let latestData = allData.map(lineData => [lineData[0]]);
      let latestDeltas = allData.map(lineData => [lineData[0]]);

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

      // Create line generator
      let line = d3.line()
        .x((d, i) => x(i + time - num))
        .y(d => y(d))
        .curve(d3.curveBasis); // Smooth the line with 'basis' interpolation

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

      // Add path elements for each line
      let paths = allData.map((_, index) => {
        return svg.append('path')
          .attr('class', `line data line-${index}`)
          .style('stroke', myColor[index % 14])
          .style('fill', 'none')
          .on('mouseover', function () {
            d3.select(this).style('stroke', '#7f7f7f');  // Turn line gray on hover
          })
          .on('mouseout', function () {
            d3.select(this).style('stroke', myColor[index % 14]);  // Revert to original color on mouse out
          });
      });

      // Add text labels for each line's name
      let labels = allData.map((lineData, index) => {
        return svg.append('text')
          .attr('class', `line-label label-${index}`)
          .text(names[index])  // Set the text to the corresponding name
          .style('fill', myColor[index % 14])
          .style('font-size', '12px');
      });

      // Function to handle the animation tick
      function tick() {
        time++;

        allData.forEach((lineData, lineIndex) => {
          if (time < lineData.length) {
            deltas[lineIndex][time] = lineData[time] - lineData[time - 1]; // Calculate deltas

            if (time <= num) {
              latestData[lineIndex] = lineData.slice(0, time);  // Use the slice of data from 0 to the current time
              latestDeltas[lineIndex] = deltas[lineIndex].slice(0, time);
            } else {
              latestData[lineIndex] = lineData.slice(time - num, time);  // Keep the latest `num` points in view
              latestDeltas[lineIndex] = deltas[lineIndex].slice(time - num, time);
            }
          }
        });
      }

      // Function to update the chart
      function update() {
        x.domain([time - num, time]);
        let allYValues = latestData.flat();  // Flatten all lines' data to find the extent
        let yDom = d3.extent(allYValues);
        yDom[0] = Math.max(yDom[0] - 1, 0);
        yDom[1] += 1;
        y.domain(yDom);

        $xAxis.call(xAxis);
        $yAxis.call(yAxis);

        paths.forEach((path, lineIndex) => {
          path.datum(latestData[lineIndex]).attr('d', line);
          // Update the position of the label
          const lastPoint = latestData[lineIndex][latestData[lineIndex].length - 1];
          if (lastPoint) {
            labels[lineIndex]
              .attr('x', x(time - 1))  // Position to the right of the last point
              .attr('y', y(lastPoint))  // Position vertically at the last point's y
              .attr('dx', 5)  // Offset to the right
              .attr('dy', 4);  // Offset vertically
          }
        });
      }

    //   // Initial rendering setup
      for (let i = 0; i < num + 50; i++) {
        tick();
      }

      update();

      // Set interval for continuous update of the chart
      setInterval(() => {
        tick();
        update();
      }, 15);
    }
  }, [graphInitialized]);

  return <div ref={coreVisRef} className='coreVisContainer'></div>;
};

export default LineChart;
