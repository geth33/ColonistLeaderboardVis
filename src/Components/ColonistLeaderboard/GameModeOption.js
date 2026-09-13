import React, { useEffect, useRef } from 'react';
import './GameModeOption.css'; // Import CSS for styling

const GameModeOption = ({ img, title, active, setActiveGameMode, displayBackground}) => {


  return (
    <div className={`gameModeOption ${active ? "active" : "inactive"} ${displayBackground ? "displayBackground" : ""}`} onClick={() => setActiveGameMode(title)}>
        <img src={img} className="optionImg"/>
        <span className="optionLabel">{title}</span>
    </div>
  );
};

export default GameModeOption;
