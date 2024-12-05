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
      <AppBar position="static" sx={{ backgroundColor: '#1e63ac' }}>
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between', // Distribute space between title and button group
            paddingX: 2, // Add horizontal padding to create space from screen edges
          }}
        >
          {/* Title */}
          <Typography
            variant="h5" // Slightly larger title
            component={Link}
            to="/"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textDecoration: 'none',
              marginRight: 'auto', // Push it to the left
            }}
          >
            Leaderboard Visualizer
          </Typography>

          {/* Button Group */}
          {isMobile ? (
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}> {/* Add spacing between buttons */}
              <Button
                color="inherit"
                component={Link}
                to="/"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/faq"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                FAQ
              </Button>
              <Button
                color="inherit"
                target="_blank"
                href="https://qualtricsxmvtb8mdg33.qualtrics.com/jfe/form/SV_8euSp8O04krdUjQ"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Give Feedback
              </Button>
            </div>
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
