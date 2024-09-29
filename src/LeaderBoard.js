import React, { useState, useEffect, useRef } from 'react';
import './LeaderBoard.css'; // Import CSS for styling
import LeaderBoardEntry from './LeaderBoardEntry';
import anime from 'animejs';

const LeaderBoard = ({ title, data, leaderBoardMetric, size }) => {
  const [sortedData, setSortedData] = useState([]);
  const [removedEntries, setRemovedEntries] = useState([]);
  const [newEntries, setNewEntries] = useState([]);
  const [previousPositions, setPreviousPositions] = useState(null);
  const listRef = useRef(null); // Ref to target the list container

  // Sort data by the given metric (rating) and set the rank
  useEffect(() => {
    const initialSortedData = Object.keys(data).map((key) => ({
      name: key,
      ...data[key],
      rank: 0, // Initialize rank, will update after sorting
    }));

    // Sort by rating and assign rank
    const sorted = initialSortedData.sort((a, b) => b[leaderBoardMetric] - a[leaderBoardMetric]);

    // Identify removed entries
    const removed = sortedData.filter(entry => !data[entry.name]);

    // Add removed entries to state for fade-out animation
    if (removed.length > 0) {
      setRemovedEntries(removed);
    }

    if (sortedData.length > 0){
      // Identify new entries (entries not present in previous data)
      const newAdded = sorted.filter(entry => !(entry.name in previousPositions));
      if (newAdded.length > 0) {
        setNewEntries(newAdded);
      }
    }

    // Store the current positions of all entries
    const positions = {};
    let newData = sortedData.length === 0 ? sorted : sortedData; 
    newData.forEach((entry, index) => {
      positions[entry.name] = index;
    });
    setPreviousPositions(positions); // Update previous positions

    setSortedData(sorted); // Update sorted data
  }, [data, leaderBoardMetric]);

  // Handle the fade-out and removal of entries
  useEffect(() => {
    if (removedEntries.length > 0) {
      removedEntries.forEach(removedEntry => {
        const itemToRemove = listRef.current.querySelector(`[data-name="${removedEntry.name}"]`);
        if (itemToRemove && previousPositions[removedEntry.name] !== undefined) {
          const prevPosition = previousPositions[removedEntry.name]; // Get the previous Y position
          anime({
            targets: itemToRemove,
            translateY: prevPosition * 40, // Start at the previous Y position
            duration: 0, // Instantly set it to the previous Y position
            complete: () => {
              anime({
                targets: itemToRemove,
                translateY: size * 40, // Move it down beyond the list
                opacity: 0, // Fade out
                duration: 500,
                easing: 'easeInOutQuad',
                complete: () => {
                  // Remove the element after the animation
                  setSortedData(prevData => prevData.filter(entry => entry.name !== removedEntry.name));
                  setRemovedEntries(prevRemoved => prevRemoved.filter(entry => entry.name !== removedEntry.name));
                }
              });
            }
          });
        }
      });
    }
  }, [removedEntries, previousPositions]);

  // Handle the animation of new entries gliding into position
  useEffect(() => {
    if (newEntries.length > 0) {
      newEntries.forEach(newEntry => {
        const newItem = listRef.current.querySelector(`[data-name="${newEntry.name}"]`);
        const newIndex = sortedData.findIndex(entry => entry.name === newEntry.name); // Find the final index
        console.log('Oh')
        if (newItem) {
          anime({
            targets: newItem,
            translateY: size * 40, // Start below the list (off-screen)
            opacity: 0, // Start fully transparent
            duration: 0, // Instantly position it off-screen
            complete: () => {
              anime({
                targets: newItem,
                translateY: newIndex * 40, // Move to its correct position directly
                opacity: 1, // Fade in
                duration: 500,
                easing: 'easeInOutQuad',
              });
            }
          });
        }
      });
    }
  }, [newEntries]); // Depend on both newEntries and sortedData for the animation

  // Glide elements into new positions when data updates
  useEffect(() => {
    if (listRef.current) {
      // Calculate new positions for each element
      const listItems = Array.from(listRef.current.children);

      // Calculate the new positions based on sortedData
      anime({
        targets: listItems,
        translateY: function (el, i) {
          return i * 40; // Move based on the new index in the sorted array
        },
        duration: 500, // Duration of the animation
        easing: 'easeInOutQuad', // Smooth animation
      });
    }
  }, [sortedData]); // Run when sortedData changes

  return (
    <div className='leaderboard'>
      <h3>{title}</h3>
      <ul ref={listRef}>
        {sortedData.map((entry, index) => (
          <LeaderBoardEntry
            key={entry.name}
            rank={index + 1} // Set the rank dynamically based on index
            name={entry.name}
            value={entry[leaderBoardMetric]} // Use rating, winRate, etc.
          />
        ))}
        {removedEntries.map((entry) => (
          <LeaderBoardEntry
            key={entry.name}
            rank={''} // Mark as removed for clarity
            name={entry.name}
            value={entry[leaderBoardMetric]} // Keep the original value
            isRemoving // Add an identifier to style it differently if needed
          />
        ))}
      </ul>
    </div>
  );
};

export default LeaderBoard;
