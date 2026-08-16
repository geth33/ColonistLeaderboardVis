// src/App.js
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  Menu,
  MenuItem,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import FAQ from './Pages/FAQ';
import Leaderboards from './Pages/Leaderboards';
import Home from './Pages/Home';
import { useTheme } from '@mui/material/styles';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Desktop Menu Anchor States
  const [colonistAnchor, setColonistAnchor] = useState(null);
  const [duelDivisionAnchor, setDuelDivisionAnchor] = useState(null);

  // Mobile Submenu States
  const [mobileColonistOpen, setMobileColonistOpen] = useState(false);
  const [mobileDuelDivisionOpen, setMobileDuelDivisionOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mobile Drawer Toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Desktop Colonist Menu Handlers
  const handleColonistClick = (event) => {
    setColonistAnchor(event.currentTarget);
  };
  const handleColonistClose = () => {
    setColonistAnchor(null);
  };

  // Desktop Duel Division Menu Handlers
  const handleDuelDivisionClick = (event) => {
    setDuelDivisionAnchor(event.currentTarget);
  };
  const handleDuelDivisionClose = () => {
    setDuelDivisionAnchor(null);
  };

  // Mobile Submenu Toggles
  const handleMobileColonistToggle = () => {
    setMobileColonistOpen(!mobileColonistOpen);
  };
  const handleMobileDuelDivisionToggle = () => {
    setMobileDuelDivisionOpen(!mobileDuelDivisionOpen);
  };

  // Mobile Navigation Drawer Content
  const drawer = (
    <List sx={{ width: 250 }}>
      <ListItemButton component={Link} to="/" onClick={handleDrawerToggle}>
        <ListItemText primary="Visualizer" />
      </ListItemButton>

      {/* Colonist Dropdown Section */}
      <ListItemButton onClick={handleMobileColonistToggle}>
        <ListItemText primary="Colonist" />
        {mobileColonistOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={mobileColonistOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton
            sx={{ pl: 4 }}
            component={Link}
            to="/colonist/hallofFame"
            onClick={handleDrawerToggle}
          >
            <ListItemText primary="Hall of Fame" />
          </ListItemButton>
          <ListItemButton
            sx={{ pl: 4 }}
            component={Link}
            to="/leaderboards"
            onClick={handleDrawerToggle}
          >
            <ListItemText primary="Past Leaderboards" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* Duel Division Dropdown Section */}
      <ListItemButton onClick={handleMobileDuelDivisionToggle}>
        <ListItemText primary="Duel Division" />
        {mobileDuelDivisionOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={mobileDuelDivisionOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton
            sx={{ pl: 4 }}
            component={Link}
            to="/duel-division/hallofFame"
            onClick={handleDrawerToggle}
          >
            <ListItemText primary="Hall of Fame" />
          </ListItemButton>
          <ListItemButton
            sx={{ pl: 4 }}
            component={Link}
            to="/duel-division/players"
            onClick={handleDrawerToggle}
          >
            <ListItemText primary="Players" />
          </ListItemButton>
        </List>
      </Collapse>

      <ListItemButton component={Link} to="/faq" onClick={handleDrawerToggle}>
        <ListItemText primary="FAQ" />
      </ListItemButton>

      <ListItemButton
        component="a"
        href="https://qualtricsxmvtb8mdg33.qualtrics.com/jfe/form/SV_8euSp8O04krdUjQ"
        target="_blank"
        onClick={handleDrawerToggle}
      >
        <ListItemText primary="Give Feedback" />
      </ListItemButton>
    </List>
  );

  return (
    <Router>
      <div className="App">
        <AppBar position="static" sx={{ backgroundColor: '#1e63ac' }}>
          <Container maxWidth="xl">
            <Toolbar
              sx={{
                display: 'flex',
                justify: 'space-between',
                paddingX: 2,
              }}
            >
              {/* Title */}
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  marginRight: 'auto',
                }}
              >
                Leaderboard Visualizer
              </Typography>

              {/* Navigation Items */}
              {isMobile ? (
                <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/"
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  >
                    Visualizer
                  </Button>

                  {/* Colonist Dropdown */}
                  <Button
                    color="inherit"
                    onClick={handleColonistClick}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  >
                    Colonist
                  </Button>
                  <Menu
                    anchorEl={colonistAnchor}
                    open={Boolean(colonistAnchor)}
                    onClose={handleColonistClose}
                  >
                    <MenuItem
                      component={Link}
                      to="/colonist/hallofFame"
                      onClick={handleColonistClose}
                    >
                      Hall of Fame
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/leaderboards"
                      onClick={handleColonistClose}
                    >
                      Past Leaderboards
                    </MenuItem>
                  </Menu>

                  {/* Duel Division Dropdown */}
                  <Button
                    color="inherit"
                    onClick={handleDuelDivisionClick}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  >
                    Duel Division
                  </Button>
                  <Menu
                    anchorEl={duelDivisionAnchor}
                    open={Boolean(duelDivisionAnchor)}
                    onClose={handleDuelDivisionClose}
                  >
                    <MenuItem
                      component={Link}
                      to="/duel-division/hallofFame"
                      onClick={handleDuelDivisionClose}
                    >
                      Hall of Fame
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/duel-division/players"
                      onClick={handleDuelDivisionClose}
                    >
                      Players
                    </MenuItem>
                  </Menu>

                  <Button
                    color="inherit"
                    component={Link}
                    to="/faq"
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  >
                    FAQ
                  </Button>

                  <Button
                    color="inherit"
                    target="_blank"
                    href="https://qualtricsxmvtb8mdg33.qualtrics.com/jfe/form/SV_8euSp8O04krdUjQ"
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  >
                    Give Feedback
                  </Button>
                </div>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
          {drawer}
        </Drawer>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/faq" element={<FAQ />} />
          {/* Add Duel Division & Colonist Hall of Fame routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;