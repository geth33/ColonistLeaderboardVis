import React, { useState, useEffect, useRef } from 'react';
import './LeaderBoard.css'; // Import CSS for styling
import LeaderBoardEntry from '../LeaderBoardEntry/LeaderBoardEntry';
import anime from 'animejs';

const LeaderBoard = ({ title, data, leaderBoardMetric, size, currSnapshot, subValueType}) => {
  const [sortedData, setSortedData] = useState([]);
  const [removedEntries, setRemovedEntries] = useState([]);
  const [newEntries, setNewEntries] = useState([]);
  const [newEntryNames, setNewEntryNames] = useState([]);
  const [suffix, setSuffix] = useState('');
  const [entrySize, setEntrySize] = useState(0);
  const [entryGap, setEntryGap] = useState(0);


  const [previousPositions, setPreviousPositions] = useState({});
  const listRef = useRef(null); // Ref to target the list container
  let keyProp = 'username';

  // Sort data by the given metric (rating) and set the rank
  useEffect(() => {
    if (data && data[currSnapshot]){
      const sorted = data[currSnapshot].map((userEntry) => ({
        name: userEntry[keyProp],
        ...userEntry,
        rank: 0, // Initialize rank, will update after sorting
      }));
      
    // Identify removed entries
    let previousNames = sorted.map(s => s.name);
    const removed = sortedData.filter(entry => !previousNames.includes(entry.name));
    // Add removed entries to state for fade-out animation
    if (removed.length > 0) {
      setRemovedEntries(removed);
    }

    // Ensure `previousPositions` is updated immediately with new entries
    const updatedPreviousPositions = { ...previousPositions };

    if (sortedData.length > 0) {
      // Identify new entries (entries not present in previous data)
      const newAdded = sorted.filter(entry => !(entry.name in previousPositions));
      if (newAdded.length > 0) {
        // Only set new entries if they aren't already present in newEntries array
        const uniqueNewEntries = newAdded.filter(entry => !newEntries.some(newEntry => newEntry.name === entry.name));
        if (uniqueNewEntries.length > 0) {
          setNewEntries(uniqueNewEntries);
          setNewEntryNames(uniqueNewEntries.map(e => e.name));
          // Add new entries immediately to `previousPositions`
          uniqueNewEntries.forEach(entry => {
            updatedPreviousPositions[entry.name] = sorted.findIndex(e => e.name === entry.name);
          });
        }
      }
    }

    // Store the current positions of all entries
    sorted.forEach((entry, index) => {
      updatedPreviousPositions[entry.name] = index;
    });

    // Update previous positions immediately
    setPreviousPositions(updatedPreviousPositions);
    // Update sorted data
    setSortedData(sorted);

    }
  }, [data, leaderBoardMetric, currSnapshot]);

  // Handle the fade-out and removal of entries
  useEffect(() => {
    if (removedEntries.length > 0) {
      removedEntries.forEach(removedEntry => {
        const itemToRemove = listRef.current.querySelector(`[data-name="${removedEntry.name}"]`);
        if (itemToRemove && previousPositions[removedEntry.name] !== undefined) {
          const prevPosition = previousPositions[removedEntry.name]; // Get the previous Y position
          anime({
            targets: itemToRemove,
            translateY: prevPosition * entryGap, // Start at the previous Y position
            duration: 0, // Instantly set it to the previous Y position
            complete: () => {
              anime({
                targets: itemToRemove,
                translateY: size * entryGap, // Move it down beyond the list
                opacity: 0, // Fade out
                duration: 500,
                easing: 'easeInOutQuad',
                complete: () => {
                  // Remove the element after the animation
                  setSortedData(prevData => prevData.filter(entry => entry.name !== removedEntry.name));
                  setPreviousPositions(prevData => Object.fromEntries(Object.entries(prevData).filter(([key]) => key !== removedEntry.name)));
                  setRemovedEntries(prevRemoved => prevRemoved.filter(entry => entry.name !== removedEntry.name));
                }
              });
            }
          });
        }
      });
    }
  }, [removedEntries, previousPositions, size]);

  // Handle the animation of new entries gliding into position
  useEffect(() => {
    if (newEntries.length > 0) {
      newEntries.forEach(newEntry => {
        const newItem = listRef.current.querySelector(`[data-name="${newEntry.name}"]`);
        const newIndex = sortedData.findIndex(entry => entry.name === newEntry.name);
  
        if (newItem) {
          anime({
            targets: newItem,
            translateY: leaderBoardMetric === 'skillRating' ? 400 : 300, // Start 400px below
            opacity: 0,
            duration: 0,
            complete: () => {
              anime({
                targets: newItem,
                translateY: newIndex * entryGap, // Move to its final position
                opacity: 1,
                duration: 500,
                easing: 'easeInOutQuad',
                complete: () => newItem.classList.remove('new') // Remove 'new' class after animation
              });
            }
          });
        }
      });
  
      setNewEntries([]);
      setNewEntryNames([]);
    }
  }, [newEntries, sortedData, size]);
  

  // Glide elements into new positions when data updates
  useEffect(() => {
    if (listRef.current) {
      // Calculate new positions for each element
      const listItems = Array.from(listRef.current.children);

      // Calculate the new positions based on sortedData
      anime({
        targets: listItems,
        translateY: function (el, i) {
          return i * entryGap; // Move based on the new index in the sorted array
        },
        duration: 500, // Duration of the animation
        easing: 'easeInOutQuad', // Smooth animation
      });
    }
  }, [sortedData]); // Run when sortedData changes

  useEffect(() => {
    if (leaderBoardMetric === 'skillRating') {
      if (window.innerWidth < 800){
        setEntryGap(35);
        setEntrySize(subValueType ? 'xl' : 'large');
      } else {
        setEntryGap(38);
        setEntrySize(subValueType ? 'xl' : 'large');
      }
    } else if (leaderBoardMetric === 'winRate') {
      setSuffix('%');
      setEntrySize('xl');
      if (window.innerWidth < 800){
        setEntryGap(40);
      } else {
        setEntryGap(42);
      }
    } else {
      setSuffix(' days');
      setEntryGap(30);
      setEntrySize('small');
    }
  }, []);

  const calculateSubValue = (entry) => {
    let text = "";
    if (subValueType === 'gamesPlayed'){
      text = "("+entry['totalGamesPlayed'] + " games)";
    } else if (subValueType === 'seasonRank') {
      text = "(rank: "+entry['playerRank'] + ")";
    } else if (subValueType === 'winRate') {
      text = "("+entry['winRate'] + "% wr)";
    }
    return text;
  }

  return (
    <div className='leaderboard'>
      <h3>{title}</h3>
      <ul ref={listRef}>
  {sortedData.map((entry, index) => (
    <LeaderBoardEntry
      key={entry.name}
      rank={index + 1}
      name={entry.name}
      value={entry[leaderBoardMetric] + suffix}
      subValue={calculateSubValue(entry)}
      size={entrySize}
      isNew={newEntryNames.includes(entry.name)} // Pass isNew based on newEntryNames
    />
  ))}
  {removedEntries.map((entry) => (
    <LeaderBoardEntry
      key={entry.name}
      rank={''}
      name={entry.name}
      value={entry[leaderBoardMetric] + suffix}
      subValue={calculateSubValue(entry)}
      size={entrySize}
      isNew={true}
      isRemoving
    />
  ))}
</ul>

    </div>
  );
};

export default LeaderBoard;
