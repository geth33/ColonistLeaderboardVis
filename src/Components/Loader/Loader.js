import React, { useEffect, useRef, useState } from 'react';
import './Loader.scss'; // Import SCSS for styling


const Loader = ({}) => {

  return (
    <main className="main container">

    <div className="col col--full">
        <div className="loader">
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
            <div className="hex"></div>
        </div>
    </div>
    </main>
  );
};

export default Loader;
