import React, { useState, useEffect, useRef } from 'react';

export default function StageIntro({ titleText = "" }) {
  const [titleVisible, setTitleVisible] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const stageRef = useRef(null);

  // Dynamic flash frequency in ms (halved initial interval)
  const flashFrequencyRef = useRef(225);

  useEffect(() => {
    let timeoutId;

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

      // Create Lens Flare Assembly Container
      const flash = document.createElement('div');
      flash.className = 'lens-flare-assembly';
      flash.style.left = `${x}px`;
      flash.style.top = `${y}px`;

      // Compact core with strong horizontal & vertical cross-flares
      flash.innerHTML = `
        <div class="flare-core"></div>
        <div class="flare-streak-h"></div>
        <div class="flare-streak-v"></div>
      `;

      document.body.appendChild(flash);

      // Halved cleanup timer (225ms instead of 450ms)
      setTimeout(() => flash.remove(), 500);
    };

    const flashLoop = () => {
      triggerPerimeterFlash();
      timeoutId = setTimeout(flashLoop, flashFrequencyRef.current);
    };

    flashLoop();

    // Fade title and slow down flashes after 1.25s (halved from 2.5s)
    const transitionTimer = setTimeout(() => {
      setTitleVisible(true);
      setIsDimmed(true);
      flashFrequencyRef.current = 2250; // Seldom ambient flashes
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(transitionTimer);
    };
  }, []);

  return (
    <div className="stage-wrapper">
      <style>{`
        .stage-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          background-color: #050505;
          color: #ffffff;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .title-stage {
          position: relative;
          padding: 20px 60px;
          /* Adjusted to move the title ~50px higher */
          margin-top: calc(10vh - 50px);
          z-index: 2;
        }

        .main-title {
          font-size: 4rem;
          letter-spacing: 4px;
          text-transform: uppercase;
          opacity: 0;
          /* Halved title fade duration (1s) */
          transition: opacity 1s ease-in-out;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
        }

        .main-title.visible {
          opacity: 1;
        }

        /* Stage Lights Cones */
        .light-cone {
          position: absolute;
          bottom: -100px;
          width: 0;
          height: 0;
          border-left: 150px solid transparent;
          border-right: 150px solid transparent;
          border-bottom: 1200px solid rgba(255, 240, 200, 0.15);
          filter: blur(30px);
          pointer-events: none;
          z-index: 1;
          transform-origin: bottom center;
          /* Halved dimming transition (0.75s) */
          transition: opacity 2s ease;
        }

        .light-left {
          left: -50px;
          transform: rotate(48deg);
          /* Halved sweep speed (0.75s) */
          animation: sweepLeft 1.2s infinite alternate ease-in-out;
        }

        .light-right {
          right: -50px;
          transform: rotate(-48deg);
          /* Halved sweep speed (0.75s) */
          animation: sweepRight 1.2s infinite alternate ease-in-out;
        }

        .light-cone.dimmed {
          opacity: 0.05;
        }

        @keyframes sweepLeft {
          0% { transform: rotate(42deg); }
          100% { transform: rotate(48deg); }
        }

        @keyframes sweepRight {
          0% { transform: rotate(-42deg); }
          100% { transform: rotate(-48deg); }
        }

        /* =========================================
           CROSS-FLARE LENS SYSTEM (NO BIG CIRCLE)
           ========================================= */
        .lens-flare-assembly {
          position: absolute;
          pointer-events: none;
          z-index: 10;
          transform: translate(-50%, -50%);
          width: 1px;
          height: 1px;
          /* Halved flash animation duration (0.225s) */
          animation: flareFade 0.225s ease-out forwards;
        }

        /* Very Small Pinpoint White Center */
        .flare-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.9);
        }

        /* Primary Horizontal Flare Streak */
        .flare-streak-h {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 360px;
          height: 3px;
          transform: translate(-50%, -50%);
          background: radial-gradient(ellipse at center,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.8) 20%,
            rgba(240, 240, 240, 0.3) 50%,
            transparent 95%
          );
          filter: blur(0.5px);
        }

        /* Primary Vertical Flare Streak */
        .flare-streak-v {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 3px;
          height: 180px;
          transform: translate(-50%, -50%);
          background: radial-gradient(ellipse at center,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.8) 20%,
            rgba(240, 240, 240, 0.3) 50%,
            transparent 95%
          );
          filter: blur(0.5px);
        }

        /* Fast Assembly Fade & Scale */
        @keyframes flareFade {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }
          25% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.3);
          }
        }
      `}</style>

      {/* Stage Lights */}
      <div className={`light-cone light-left ${isDimmed ? 'dimmed' : ''}`} />
      <div className={`light-cone light-right ${isDimmed ? 'dimmed' : ''}`} />

      {/* Title Target Container */}
      <div className="title-stage" ref={stageRef}>
        <h1 className={`main-title ${titleVisible ? 'visible' : ''}`}>
          Hall of Fame
        </h1>
      </div>
    </div>
  );
}


