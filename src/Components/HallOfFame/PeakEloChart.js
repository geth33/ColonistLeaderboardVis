import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DotLottiePlayer } from '@dotlottie/react-player';

// Reference anchor: Season 4 started on May 29, 2023
const KNOWN_SEASON_NUM = 4;
const KNOWN_SEASON_DATE = new Date(2023, 4, 29); // May 29, 2023
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

// Helper: Convert string to camelCase
const toCamelCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, '');
};

// Helper: Check if an image file exists on the server/public folder
const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Helper: Resolve player image path (.png -> .jpg -> fallback crown)
const getPlayerImagePath = async (username) => {
  if (!username) return '/img/chartCrown.png';
  const camelName = toCamelCase(username);

  const pngPath = `/img/playerImage/${camelName}.png`;
  if (await checkImageExists(pngPath)) return pngPath;

  const jpgPath = `/img/playerImage/${camelName}.jpg`;
  if (await checkImageExists(jpgPath)) return jpgPath;

  return '/img/chartCrown.png';
};

// Calculate the base season dynamically based on the earliest data point
const getDynamicBaseSeason = (firstDate) => {
  let seasonNum = KNOWN_SEASON_NUM;
  let seasonDate = new Date(KNOWN_SEASON_DATE);

  if (firstDate < KNOWN_SEASON_DATE) {
    while (seasonDate > firstDate) {
      seasonDate = d3.timeMonth.offset(seasonDate, -3);
      seasonNum -= 1;
    }
  } else {
    while (d3.timeMonth.offset(seasonDate, 3) <= firstDate) {
      seasonDate = d3.timeMonth.offset(seasonDate, 3);
      seasonNum += 1;
    }
  }

  return { baseSeasonNum: seasonNum, baseSeasonDate: seasonDate };
};

const generateAllSeasonTicks = (baseSeasonNum, baseSeasonDate, endDate) => {
  const ticks = [];
  let currentSeasonNum = baseSeasonNum;
  let currentSeasonDate = new Date(baseSeasonDate);

  const maxBound = d3.timeMonth.offset(endDate, 6);

  while (currentSeasonDate <= maxBound) {
    ticks.push({
      seasonNum: currentSeasonNum,
      date: new Date(currentSeasonDate),
      label: `Season ${currentSeasonNum}`,
    });
    currentSeasonDate = d3.timeMonth.offset(currentSeasonDate, 3);
    currentSeasonNum += 1;
  }

  return ticks;
};

const PeakEloChart = ({ data = [] }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const lottieRef = useRef(null);

  const [isZoomed, setIsZoomed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLottie, setShowLottie] = useState(false);

  const zoomBehaviorRef = useRef(null);
  const svgSelectionRef = useRef(null);

  // -----------------------------------------------------------------
  // Lottie Animation Loop (Plays every 5s with Fade In/Out)
  // -----------------------------------------------------------------
  useEffect(() => {
    if (hasInteracted) {
      setShowLottie(false);
      return;
    }

    const triggerAnimation = () => {
      setShowLottie(true);
      if (lottieRef.current) {
        lottieRef.current.seek(0);
        lottieRef.current.play();
      }

      // Hide/fade out after the 1-second animation finishes
      setTimeout(() => {
        setShowLottie(false);
      }, 1000);
    };

    // Play initial cycle after mounting
    const initialTimer = setTimeout(triggerAnimation, 500);

    // Repeat every 5 seconds
    const interval = setInterval(triggerAnimation, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [hasInteracted]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    let isMounted = true;

    const renderChart = async () => {
      const containerWidth = containerRef.current ? containerRef.current.clientWidth : 800;
      const isMobile = containerWidth < 600;

      const viewBoxWidth = isMobile ? 600 : 800;
      const viewBoxHeight = isMobile ? 500 : 480;

      const margin = isMobile
        ? { top: 25, right: 25, bottom: 55, left: 50 }
        : { top: 30, right: 40, bottom: 65, left: 70 };

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

      // Glow Filter & Gradient
      const filter = defs
        .append('filter')
        .attr('id', 'crown-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');

      filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');

      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      const goldLinearGradient = defs
        .append('linearGradient')
        .attr('id', 'gold-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      const goldColors = ['#f5f074', '#f7ff70', '#feea6a', '#ffc907', '#f1bd04', '#e5ad40'];
      goldColors.forEach((color, index) => {
        goldLinearGradient
          .append('stop')
          .attr('offset', `${(index / (goldColors.length - 1)) * 100}%`)
          .attr('stop-color', color);
      });

      // Background rect
      svg
        .append('rect')
        .attr('class', 'chart-bg')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'rgba(255, 255, 255, 0.4)')
        .attr('rx', 6)
        .style('cursor', 'grab');

      // Clip path for chart boundary
      defs
        .append('clipPath')
        .attr('id', 'chart-clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height);

      // Parsing & Data Normalization
      const parseDate = d3.timeParse('%Y-%m-%d');
      const formatDate = d3.timeFormat('%B %d, %Y');
      const formatTickDate = d3.timeFormat('%m/%d/%Y');

      const formattedData = data
        .map((d) => {
          const rawDate = d.created_at || d.date;
          const cleanDateStr = rawDate ? String(rawDate).substring(0, 10) : '';
          return {
            ...d,
            skillRating: Number(d.skillRating),
            parsedDate: parseDate(cleanDateStr),
          };
        })
        .filter((d) => d.parsedDate && !isNaN(d.skillRating))
        .sort((a, b) => a.parsedDate - b.parsedDate);

      if (formattedData.length === 0) return;

      const firstEntryDate = formattedData[0].parsedDate;
      const { baseSeasonNum, baseSeasonDate } = getDynamicBaseSeason(firstEntryDate);

      const imagePathPromises = formattedData.map((d) => getPlayerImagePath(d.username));
      const resolvedPaths = await Promise.all(imagePathPromises);

      if (!isMounted) return;

      formattedData.forEach((d, index) => {
        const path = resolvedPaths[index];
        d.imagePath = path;
        d.isPlayerAvatar = path !== '/img/chartCrown.png';

        if (d.isPlayerAvatar) {
          const patternId = `avatar-pattern-${toCamelCase(d.username)}`;

          if (defs.select(`#${patternId}`).empty()) {
            const pattern = defs
              .append('pattern')
              .attr('id', patternId)
              .attr('width', 1)
              .attr('height', 1)
              .attr('patternContentUnits', 'objectBoundingBox');

            pattern
              .append('image')
              .attr('href', path)
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', 1)
              .attr('height', 1)
              .attr('preserveAspectRatio', 'xMidYMid slice');
          }
          d.patternId = patternId;
        }
      });

      // Grouping Logic
      const groups = [];
      let currentGroup = [formattedData[0]];

      for (let i = 1; i < formattedData.length; i++) {
        const prevDate = formattedData[i - 1].parsedDate;
        const currDate = formattedData[i].parsedDate;

        if (currDate.getTime() - prevDate.getTime() <= THREE_DAYS_MS) {
          currentGroup.push(formattedData[i]);
        } else {
          groups.push(currentGroup);
          currentGroup = [formattedData[i]];
        }
      }
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      // Extents & Scale Setup
      const [dataMinDate, dataMaxDate] = d3.extent(formattedData, (d) => d.parsedDate);
      const [dataMinRating, dataMaxRating] = d3.extent(formattedData, (d) => d.skillRating);

      const domainMinDate = d3.min([dataMinDate, baseSeasonDate]);

      const xBase = d3
        .scaleTime()
        .domain([d3.timeDay.offset(domainMinDate, -15), d3.timeDay.offset(dataMaxDate, 15)])
        .range([0, width]);

      const yMin = dataMinRating === dataMaxRating ? dataMinRating - 20 : dataMinRating - 20;
      const yMax = dataMinRating === dataMaxRating ? dataMaxRating + 20 : dataMaxRating + 20;

      const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

      // Gridlines
      const xGridGroup = svg
        .append('g')
        .attr('class', 'grid x-grid')
        .attr('transform', `translate(0, ${height})`);

      svg
        .append('g')
        .attr('class', 'grid y-grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
        .attr('stroke-opacity', 0.15);

      const allSeasonTicks = generateAllSeasonTicks(baseSeasonNum, baseSeasonDate, dataMaxDate);

      const xAxisGroup = svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`);

      svg.append('g').attr('class', 'y-axis').call(d3.axisLeft(y).ticks(isMobile ? 5 : 8));

      // Axis Titles
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height + (isMobile ? 45 : margin.bottom - 8))
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '0.75rem' : '0.9rem')
        .style('font-weight', '600')
        .text('Time (Seasons)');

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', isMobile ? -margin.left + 14 : -margin.left + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '0.75rem' : '0.9rem')
        .style('font-weight', '600')
        .text('ELO Rating');

      // Clipped Chart Group
      const chartBody = svg.append('g').attr('clip-path', 'url(#chart-clip)');

      const shadowPath = chartBody
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', '#1a1a1a')
        .attr('stroke-width', isMobile ? 3.5 : 5)
        .attr('opacity', 0.1);

      const mainPath = chartBody
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'url(#gold-gradient)')
        .attr('stroke-width', isMobile ? 3 : 4)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 0.6);

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
        .style('font-size', isMobile ? '0.8rem' : '0.9rem')
        .style('pointer-events', 'none')
        .style('transition', 'opacity 0.2s ease')
        .style('z-index', 30);

      const nodeSize = isMobile ? 28 : 38;
      const nodeRadius = nodeSize / 2;

      const nodesGroup = chartBody.append('g').attr('class', 'nodes-group');

      // Zoom setup & interaction listeners
      const zoom = d3
        .zoom()
        .scaleExtent([1, 12])
        .extent([
          [0, 0],
          [width, height],
        ])
        .filter((event) => !event.ctrlKey || event.type === 'wheel' || event.type === 'touchstart')
        .on('zoom', (event) => {
          // Disable Lottie permanently on any zoom/pan gesture
          if (event.sourceEvent) {
            setHasInteracted(true);
          }

          const { transform } = event;
          const newXScale = transform.rescaleX(xBase);
          const k = transform.k;
          setIsZoomed(k > 1.05);

          zoom.translateExtent([
            [-width * (k - 0.5), 0],
            [width * k, height],
          ]);

          xGridGroup
            .call(d3.axisBottom(newXScale).tickSize(-height).tickFormat(''))
            .attr('stroke-opacity', 0.15);

          let seasonStep = 3;
          if (k >= 3.2) {
            seasonStep = 1;
          } else if (k >= 1.8) {
            seasonStep = 2;
          }

          const visibleSeasonTicks = allSeasonTicks.filter(
            (s) => (s.seasonNum - baseSeasonNum) % seasonStep === 0
          );
          const activeTickValues = visibleSeasonTicks.map((s) => s.date);

          const xAxis = d3
            .axisBottom(newXScale)
            .tickValues(activeTickValues)
            .tickFormat((d) => {
              const match = visibleSeasonTicks.find((s) => s.date.getTime() === d.getTime());
              return match ? match.label : '';
            });

          xAxisGroup.call(xAxis);

          xAxisGroup.selectAll('.tick').each(function (d) {
            const tickElement = d3.select(this);
            tickElement.selectAll('.tick-date').remove();
            const match = visibleSeasonTicks.find((s) => s.date.getTime() === d.getTime());
            if (match) {
              tickElement
                .append('text')
                .attr('class', 'tick-date')
                .attr('fill', 'currentColor')
                .attr('y', isMobile ? 20 : 26)
                .attr('dy', '0.71em')
                .attr('font-size', isMobile ? '0.65rem' : '0.75rem')
                .attr('opacity', 0.5)
                .text(`(${formatTickDate(match.date)})`);
            }
          });

          const lineGenerator = d3
            .line()
            .x((d) => newXScale(d.parsedDate))
            .y((d) => y(d.skillRating));

          shadowPath.attr('d', lineGenerator(formattedData));
          mainPath.attr('d', lineGenerator(formattedData));

          nodesGroup.selectAll('*').remove();

          const isDeepZoom = k > 2.2;

          groups.forEach((groupItems) => {
            if (groupItems.length === 1 || isDeepZoom) {
              groupItems.forEach((d) => {
                const cx = newXScale(d.parsedDate);
                const cy = y(d.skillRating);

                const itemG = nodesGroup
                  .append('g')
                  .attr('class', 'node-item')
                  .attr('transform', `translate(${cx}, ${cy})`)
                  .style('cursor', 'pointer');

                if (d.isPlayerAvatar) {
                  itemG
                    .append('circle')
                    .attr('r', nodeRadius)
                    .attr('fill', `url(#${d.patternId})`)
                    .attr('stroke', '#ffc907')
                    .attr('stroke-width', 2);
                } else {
                  itemG
                    .append('image')
                    .attr('class', 'crown-node')
                    .attr('href', d.imagePath)
                    .attr('x', -nodeRadius)
                    .attr('y', -nodeRadius)
                    .attr('width', nodeSize)
                    .attr('height', nodeSize)
                    .style('filter', 'url(#crown-glow)');
                }

                itemG
                  .on('mouseover touchstart', function (evt) {
                    setHasInteracted(true);
                    Tooltip.style('opacity', 1);
                    d3.select(this)
                      .transition()
                      .duration(150)
                      .attr('transform', `translate(${cx}, ${cy}) scale(1.25)`);
                  })
                  .on('mousemove touchmove', function (evt) {
                    const [mouseX, mouseY] = d3.pointer(evt, containerRef.current);
                    Tooltip.html(
                      `Player: <strong>${d.username}</strong><br/>` +
                        `Rating: <strong>${d.skillRating}</strong><br/>` +
                        `Date: ${formatDate(d.parsedDate)}`
                    )
                      .style('left', `${Math.min(mouseX + 10, containerWidth - 140)}px`)
                      .style('top', `${mouseY - 45}px`);
                  })
                  .on('mouseleave touchend', function () {
                    Tooltip.style('opacity', 0);
                    d3.select(this)
                      .transition()
                      .duration(150)
                      .attr('transform', `translate(${cx}, ${cy}) scale(1)`);
                  });
              });
            } else {
              const groupMinDate = groupItems[0].parsedDate;
              const groupMaxDate = groupItems[groupItems.length - 1].parsedDate;
              const avgRating = d3.mean(groupItems, (d) => d.skillRating);

              const centerX = (newXScale(groupMinDate) + newXScale(groupMaxDate)) / 2;
              const centerY = y(avgRating);

              const uniqueUsernames = [
                ...new Set(groupItems.map((item) => item.username && item.username.toLowerCase())),
              ];
              const isSinglePlayerGroup = uniqueUsernames.length === 1 && groupItems[0].isPlayerAvatar;
              const singlePlayerData = isSinglePlayerGroup ? groupItems[0] : null;

              const groupG = nodesGroup
                .append('g')
                .attr('class', 'group-cluster')
                .attr('transform', `translate(${centerX}, ${centerY})`)
                .style('cursor', 'pointer')
                .on('click', (evt) => {
                  evt.stopPropagation();
                  setHasInteracted(true);
                  zoomToGroup(groupItems);
                })
                .on('mouseover touchstart', function () {
                  setHasInteracted(true);
                  Tooltip.style('opacity', 1);
                  d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('transform', `translate(${centerX}, ${centerY}) scale(1.2)`);
                })
                .on('mousemove touchmove', function (evt) {
                  const [mouseX, mouseY] = d3.pointer(evt, containerRef.current);
                  Tooltip.html(
                    `<strong>Group of ${groupItems.length} Games</strong><br/>` +
                      (singlePlayerData ? `Player: <strong>${singlePlayerData.username}</strong><br/>` : '') +
                      `Date Range: ${formatDate(groupMinDate)} - ${formatDate(groupMaxDate)}<br/>` +
                      `Tap/click to zoom in`
                  )
                    .style('left', `${Math.min(mouseX + 10, containerWidth - 160)}px`)
                    .style('top', `${mouseY - 45}px`);
                })
                .on('mouseleave touchend', function () {
                  Tooltip.style('opacity', 0);
                  d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('transform', `translate(${centerX}, ${centerY}) scale(1)`);
                });

              if (singlePlayerData) {
                groupG
                  .append('circle')
                  .attr('r', nodeRadius)
                  .attr('fill', `url(#${singlePlayerData.patternId})`)
                  .attr('stroke', '#ffc907')
                  .attr('stroke-width', 2);
              } else {
                groupG
                  .append('image')
                  .attr('href', '/img/chartCrown.png')
                  .attr('x', -nodeRadius)
                  .attr('y', -nodeRadius)
                  .attr('width', nodeSize)
                  .attr('height', nodeSize)
                  .style('filter', 'url(#crown-glow)');
              }

              const badgeRadius = isMobile ? 8 : 10;
              const badgeOffset = isMobile ? 8 : 12;

              groupG
                .append('circle')
                .attr('cx', badgeOffset)
                .attr('cy', -badgeOffset)
                .attr('r', badgeRadius)
                .attr('fill', '#0f172a')
                .attr('stroke', '#ffc907')
                .attr('stroke-width', 1.5);

              groupG
                .append('text')
                .attr('x', badgeOffset)
                .attr('y', -badgeOffset + (isMobile ? 3 : 4))
                .attr('text-anchor', 'middle')
                .attr('font-size', isMobile ? '8px' : '10px')
                .attr('font-weight', 'bold')
                .attr('fill', '#ffffff')
                .text(groupItems.length);
            }
          });
        });

      const zoomToGroup = (groupItems) => {
        const minDate = d3.min(groupItems, (d) => d.parsedDate);
        const maxDate = d3.max(groupItems, (d) => d.parsedDate);

        const centerDate = new Date((minDate.getTime() + maxDate.getTime()) / 2);
        const xCenter = xBase(centerDate);

        const k = 2.8;
        const tx = width / 2 - xCenter * k;

        svgElement
          .transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(tx, 0).scale(k));
      };

      zoomBehaviorRef.current = zoom;
      svgSelectionRef.current = svgElement;

      svgElement.call(zoom);

      svgElement.on(
        'wheel',
        (event) => {
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) {
            event.preventDefault();
            setHasInteracted(true);
            const currentTransform = d3.zoomTransform(svgElement.node());
            const panDx = -event.deltaX;

            const updatedTransform = currentTransform.translate(panDx / currentTransform.k, 0);
            svgElement.call(zoom.transform, updatedTransform);
          }
        },
        { passive: false }
      );

      svgElement.call(zoom.transform, d3.zoomIdentity);

      svg.select('.chart-bg').on('click', () => {
        setHasInteracted(true);
        resetZoom();
      });
    };

    renderChart();

    const handleResize = () => {
      renderChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  const resetZoom = () => {
    if (svgSelectionRef.current && zoomBehaviorRef.current) {
      svgSelectionRef.current
        .transition()
        .duration(750)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setHasInteracted(true)}
      onTouchStart={() => setHasInteracted(true)}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        margin: '12px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* LOTTIE ANIMATION OVERLAY                                      */}
      {/* ------------------------------------------------------------- */}
      {!hasInteracted && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            opacity: showLottie ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
          }}
        >
          <DotLottiePlayer
            ref={lottieRef}
            src="/animations/pinch.lottie"
            autoplay={false}
            loop={false}
            style={{ width: '30%', height: '30%' }}
          />
        </div>
      )}

      {/* Reset Zoom Button */}
      {isZoomed && (
        <button
          onClick={resetZoom}
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            zIndex: 25,
            padding: '5px 10px',
            backgroundColor: '#1a1a1a',
            color: '#ffc907',
            border: '1px solid #ffc907',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          }}
        >
          Reset Zoom
        </button>
      )}

      <svg ref={svgRef}></svg>
    </div>
  );
};
export default PeakEloChart;