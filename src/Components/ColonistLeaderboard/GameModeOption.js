import React, { useEffect, useRef } from 'react';
import './GameModeOption.css'; // Import CSS for styling

const GameModeOption = ({ img, title, active, setActiveGameMode}) => {


  return (
    <div className={`gameModeOption ${active ? "active" : ""}`} onClick={() => setActiveGameMode(title)}>
        <img src={img} className="optionImg"/>
        <span className="optionLabel">{title}</span>
    </div>
  );
};

export default GameModeOption;
