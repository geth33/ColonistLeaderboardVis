// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import FAQ from './Pages/FAQ';
import Home from './Pages/Home';

function App() {
  return (
    <Router>
      <div className='App'>
      <AppBar position="static" color="primary">
          <Container>
            <Toolbar>
              <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', textAlign: 'left' }}>
                Data Tracker
              </Typography>
              <Button color="inherit" component={Link} to="/">Home</Button>
              <Button color="inherit" component={Link} to="/faq">FAQ</Button>
            </Toolbar>
          </Container>
        </AppBar>

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
