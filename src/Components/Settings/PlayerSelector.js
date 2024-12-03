import React from 'react';
import './PlayerSelector.css'; // Import CSS for styling
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close'; // Import MUI close icon

const ITEM_HEIGHT = 36; // Reduced item height
const ITEM_PADDING_TOP = 4; // Reduced padding
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const seasonsEnum = ['All', '7', '8', '9', '10', '11'];

const PlayerSelector = ({ player, currPlayersLength, onUpdate, onRemove }) => {
  const [username, setUsername] = React.useState(player.username || '');
  const [seasons, setSeasons] = React.useState(['All']);

  const handleSeasonChange = (event) => {
    const {
      target: { value },
    } = event;
    let options = value;
    // Current set of seasons does not include 'All' but user now wants to include all seasons. 
    let selectingAll = !seasons.includes('All') && options.includes('All');

    const updatedSeasons = selectingAll ? ['All'] : options.filter((option) => option !== "All").sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    setSeasons(updatedSeasons);
    onUpdate({ username, seasons: updatedSeasons });
  };

  const handleUsernameChange = (event) => {
    const updatedUsername = event.target.value;
    setUsername(updatedUsername);
    onUpdate({ username: updatedUsername, seasons: seasons });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
      <FormControl size="small" sx={{ marginRight: '1em' }}>
        <Select
          className="seasonSelector"
          multiple
          value={seasons}
          onChange={handleSeasonChange}
          input={<OutlinedInput label="Tag" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {seasonsEnum.map((s) => (
            <MenuItem key={s} value={s} style={{ padding: '4px 8px' }}>
              <Checkbox checked={seasons.includes(s)} />
              <ListItemText primary={s} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        id="outlined-basic"
        variant="standard"
        className="playerNameField"
        value={username}
        onChange={handleUsernameChange}
        style={{ marginRight: '1em' }}
      />
      {
        currPlayersLength > 1 && <Button
        onClick={onRemove}
        aria-label="remove player"
        variant="contained"
        color="error"
        sx={{
          fontWeight: 'bold',
          minWidth: '15px',
          width: '15px',
        }}
        disabled={player.onlyItem} // Disable if it's the only player
      >
        <CloseIcon fontSize="small" />
      </Button>
      }
    </div>
  );
};

export default PlayerSelector;
