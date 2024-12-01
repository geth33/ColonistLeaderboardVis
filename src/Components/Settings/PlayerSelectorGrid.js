import React, { useState } from 'react';
import './PlayerSelectorGrid.css'; // Import CSS for styling
import PlayerSelector from './PlayerSelector'; // Import the PlayerSelector component
import Button from '@mui/material/Button';


const PlayerSelectorGrid = ({ onPlayerDataChange }) => {
  const [players, setPlayers] = useState([{ id: Date.now(), username: '', seasons: [] }]); // Use unique IDs

  const addPlayer = () => {
    setPlayers([...players, { id: Date.now(), username: '', seasons: [] }]);
  };

  const updatePlayer = (id, updatedPlayer) => {
    const updatedPlayers = players.map((player) =>
      player.id === id ? { ...player, ...updatedPlayer } : player
    );
    setPlayers(updatedPlayers);
    if (onPlayerDataChange) {
      onPlayerDataChange(updatedPlayers);
    }
  };

  const removePlayer = (id) => {
    if (players.length > 1) {
      const updatedPlayers = players.filter((player) => player.id !== id);
      setPlayers(updatedPlayers);
      if (onPlayerDataChange) {
        onPlayerDataChange(updatedPlayers);
      }
    }
  };

  return (
    <div id="playerSelectorGrid">
      <div style={{ display: 'flex', marginBottom: '0.5em' }}>
        <span className="playerSelectorGridHeader" style={{ width: '100px' }}>
          Seasons
        </span>
        <span className="playerSelectorGridHeader" style={{ width: '180px' }}>
          Username
        </span>
      </div>
      {players.map((player) => (
        <PlayerSelector
          key={player.id}
          player={player}
          currPlayersLength={players.length}
          onUpdate={(updatedPlayer) => updatePlayer(player.id, updatedPlayer)}
          onRemove={() => removePlayer(player.id)}
        />
      ))}
      <Button onClick={addPlayer} style={{ marginTop: '0.25em', marginBottom: '1em',background: 'white', fontSize: '12px', fontWeight: 'bold', padding: '2px 8px'}}>
        + Add Player
      </Button>
    </div>
  );
};

export default PlayerSelectorGrid;
