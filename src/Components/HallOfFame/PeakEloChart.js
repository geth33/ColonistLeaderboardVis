import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const sampleData = [
  { playerName: 'TofuTyrant', skillRating: 8100, date: '2024-01-01' },
  { playerName: 'TofuTyrant', skillRating: 8350, date: '2024-07-01' },
  { playerName: 'TofuTyrant', skillRating: 8400, date: '2025-03-01' },
  { playerName: 'TofuTyrant', skillRating: 8700, date: '2025-08-01' },
  { playerName: 'TofuTyrant', skillRating: 8750, date: '2025-08-02' },
  { playerName: 'TofuTyrant', skillRating: 9100, date: '2026-06-01' },
    { playerName: 'TofuTyrant', skillRating: 9100, date: '2027-06-01' },

];

const BASE_SEASON_DATE = new Date(2023, 10, 1); // Season 7 (Nov 1, 2023)

const generateSeasonTicks = (startDate, endDate) => {
  const ticks = [];
  const baseSeason = 7;

  let currentSeasonDate = new Date(BASE_SEASON_DATE);
  let currentSeasonNum = baseSeason;

  const maxBound = d3.timeMonth.offset(endDate, 1);

  while (currentSeasonDate <= maxBound) {
    ticks.push({
      date: new Date(currentSeasonDate),
      label: `Season ${currentSeasonNum}`,
    });
    // Advance date by 6 months (2 seasons) and season number by 2
    currentSeasonDate = d3.timeMonth.offset(currentSeasonDate, 6);
    currentSeasonNum += 2;
  }

  return ticks;
};

const PeakEloChart = ({ rank, name, value }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!sampleData || sampleData.length === 0) return;

    const viewBoxWidth = 800;
    const viewBoxHeight = 480;

    const margin = { top: 30, right: 40, bottom: 65, left: 70 };
    const width = viewBoxWidth - margin.left - margin.right;
    const height = viewBoxHeight - margin.top - margin.bottom;

    const container = d3.select(containerRef.current);
    const svgElement = d3.select(svgRef.current);

    svgElement.selectAll('*').remove();
    container.selectAll('.tooltip').remove();

    const svg = svgElement
      .attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = svgElement.append('defs');

    // Crown Glow Filter
    const filter = defs
      .append('filter')
      .attr('id', 'crown-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Gradient definitions
    const goldLinearGradient = defs
      .append('linearGradient')
      .attr('id', 'gold-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    const goldColors = [
      '#f5f074',
      '#f7ff70',
      '#feea6a',
      '#ffc907',
      '#f1bd04',
      '#e5ad40',
    ];

    goldColors.forEach((color, index) => {
      goldLinearGradient
        .append('stop')
        .attr('offset', `${(index / (goldColors.length - 1)) * 100}%`)
        .attr('stop-color', color);
    });

    // Background
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(255, 255, 255, 0.4)')
      .attr('rx', 6);

    // Parsing & Scales
    const parseDate = d3.timeParse('%Y-%m-%d');
    const formatDate = d3.timeFormat('%B %d, %Y');
    const formatTickDate = d3.timeFormat('%m/%d/%Y');

    const formattedData = sampleData.map((d) => ({
      ...d,
      parsedDate: parseDate(d.date),
    }));

    const [dataMinDate, dataMaxDate] = d3.extent(formattedData, (d) => d.parsedDate);
    const [dataMinRating, dataMaxRating] = d3.extent(formattedData, (d) => d.skillRating);

    // Ensure domain stretches far enough left to contain Season 7
    const domainMinDate = d3.min([dataMinDate, BASE_SEASON_DATE]);

    const x = d3
      .scaleTime()
      .domain([d3.timeDay.offset(domainMinDate, -15), d3.timeDay.offset(dataMaxDate, 15)])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([dataMinRating - 150, dataMaxRating + 150])
      .range([height, 0]);

    // Gridlines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(''))
      .attr('stroke-opacity', 0.15);

    svg
      .append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
      .attr('stroke-opacity', 0.15);

    // Season Ticks (Every 2nd season starting at Season 7)
    const seasonTicks = generateSeasonTicks(dataMinDate, dataMaxDate);
    const seasonTickValues = seasonTicks.map((s) => s.date);

    const xAxis = d3
      .axisBottom(x)
      .tickValues(seasonTickValues)
      .tickFormat((d) => {
        const match = seasonTicks.find((s) => s.date.getTime() === d.getTime());
        return match ? match.label : '';
      });

    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    xAxisGroup.selectAll('.tick').each(function (d) {
      const match = seasonTicks.find((s) => s.date.getTime() === d.getTime());
      if (match) {
        d3.select(this)
          .append('text')
          .attr('fill', 'currentColor')
          .attr('y', 26)
          .attr('dy', '0.71em')
          .attr('font-size', '0.75rem')
          .attr('opacity', 0.5)
          .text(`(${formatTickDate(match.date)})`);
      }
    });

    svg.append('g').call(d3.axisLeft(y));

    // Axis Labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('font-weight', '600')
      .text('Time (Seasons)');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('font-weight', '600')
      .text('ELO Rating');

    // Line Generators
    const lineGenerator = d3
      .line()
      .x((d) => x(d.parsedDate))
      .y((d) => y(d.skillRating));

    // Backdrop contrast stroke
    svg
      .append('path')
      .datum(formattedData)
      .attr('fill', 'none')
      .attr('stroke', '#1a1a1a')
      .attr('stroke-width', 5)
      .attr('opacity', 0.1)
      .attr('d', lineGenerator);

    // Main Gold Stroke
    svg
      .append('path')
      .datum(formattedData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#gold-gradient)')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('opacity', 0.6)
      .attr('d', lineGenerator);

    // Tooltip
    const Tooltip = container
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('color', 'black')
      .style('border', 'solid 2px black')
      .style('border-radius', '5px')
      .style('padding', '6px 10px')
      .style('pointer-events', 'none')
      .style('transition', 'opacity 0.2s ease')
      .style('z-index', 10);

    const crownSize = 38;
    const crownOffset = crownSize / 2;

    // Render Data Points
    svg
      .append('g')
      .selectAll('image.crown-node')
      .data(formattedData)
      .enter()
      .append('image')
      .attr('class', 'crown-node')
      .attr('href', '/img/goldCrown.png')
      .attr('x', (d) => x(d.parsedDate) - crownOffset)
      .attr('y', (d) => y(d.skillRating) - crownOffset)
      .attr('width', crownSize)
      .attr('height', crownSize)
      .style('filter', 'url(#crown-glow)')
      .style('cursor', 'pointer')
      .style('transition', 'transform 0.15s ease')
      .on('mouseover', function () {
        Tooltip.style('opacity', 1);
        d3.select(this)
          .attr('width', crownSize * 1.25)
          .attr('height', crownSize * 1.25)
          .attr('x', (d) => x(d.parsedDate) - (crownSize * 1.25) / 2)
          .attr('y', (d) => y(d.skillRating) - (crownSize * 1.25) / 2);
      })
      .on('mousemove', function (event, d) {
        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
        Tooltip.html(
          `Player: <strong>${d.playerName}</strong><br/>` +
            `Rating: <strong>${d.skillRating}</strong><br/>` +
            `Date: ${formatDate(d.parsedDate)}`
        )
          .style('left', `${mouseX + 15}px`)
          .style('top', `${mouseY - 10}px`);
      })
      .on('mouseleave', function () {
        Tooltip.style('opacity', 0);
        d3.select(this)
          .attr('width', crownSize)
          .attr('height', crownSize)
          .attr('x', (d) => x(d.parsedDate) - crownOffset)
          .attr('y', (d) => y(d.skillRating) - crownOffset);
      });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PeakEloChart;