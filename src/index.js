import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { StoreProvider } from './Store/storeProvider';
import store from './Store/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StoreProvider value={store}>
    <App />
  </StoreProvider>
);
