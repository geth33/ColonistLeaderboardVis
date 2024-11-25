import React from 'react';

export const StoreContext = React.createContext(null);

export const StoreProvider = ({ children, value }) => {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => React.useContext(StoreContext);