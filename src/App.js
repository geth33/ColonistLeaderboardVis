// src/App.js
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FAQ from './Pages/FAQ';
import Home from './Pages/Home';
import { useTheme } from '@mui/material/styles';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      <ListItem button component={Link} to="/" onClick={handleDrawerToggle}>
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem button component={Link} to="/faq" onClick={handleDrawerToggle}>
        <ListItemText primary="FAQ" />
      </ListItem>
      <ListItem button component="a" href="https://qualtricsxmvtb8mdg33.qualtrics.com/jfe/form/SV_8euSp8O04krdUjQ" target="_blank" onClick={handleDrawerToggle}>
        <ListItemText primary="Give Feedback" />
      </ListItem>
    </List>
  );

  return (
    <Router>
      <div className="App">
        <AppBar position="static" color="primary">
          <Container>
            <Toolbar>
              <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', textAlign: 'left' }}>
                Leaderboard Visualizer
              </Typography>
              {isMobile ? (
                <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/">Home</Button>
                  <Button color="inherit" component={Link} to="/faq">FAQ</Button>
                  <Button color="inherit" target="_blank" href="https://qualtricsxmvtb8mdg33.qualtrics.com/jfe/form/SV_8euSp8O04krdUjQ">Give Feedback</Button>
                </>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        {/* Drawer for mobile view */}
        <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
          {drawer}
        </Drawer>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
