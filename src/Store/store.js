import { makeObservable, observable, action, runInAction } from 'mobx';
import { readDataFromFile, readFinalRankingsFromFile } from '../utils/importDataUtils';
import Papa from 'papaparse';


class Store {
  // Use observable.ref to prevent MobX from deeply wrapping massive datasets
  oneOnOneData = null;
  oneOnOneMaxSnapshotMap = null;
  oneOnOneSeasonSnapshotsMap = null;
  oneOnOneSeasonFinalRankingMap = null;

  // oneOnOne Hall of Fame
  oneOnOneFallOfFameLoaded = false;
  // Record breaks over time (for line chart)
  oneOnOneRatingRecords = null;
  // win rates
  oneOnOneWinRates = null;
  // final ranking appearances
  oneOnOneFinishes = null;
  // Peak Skill Ratings
  oneOnOnePeakSkillRatings = null;
  // Time in brackets
  oneOnOneTimeIn = null;


  baseData = null;
  baseMaxSnapshotMap = null;
  baseSeasonSnapshotsMap = null;
  baseSeasonFinalRankingMap = null;

  // Base Hall of Fame
  // base Hall of Fame
  baseFallOfFameLoaded = false;
  // Record breaks over time (for line chart)
  baseRatingRecords = null;
  // win rates
  baseWinRate75Games = null;
  baseWinRate100Games = null;
  baseWinRate200Games = null;
  baseWinRate500Games = null;
  // final ranking appearances
  baseFinishesTop1 = null;
  baseFinishesTop5 = null;
  baseFinishesTop10 = null;
  baseFinishesTop100 = null;
  // Peak Skill Ratings
  basePeakSkillRatings = null;
  // Time in brackets
  baseTimeInTop1 = null;
  baseTimeInTop5 = null;
  baseTimeInTop10 = null;
  baseTimeInTop100 = null;

  constructor() {
    makeObservable(this, {
      // Mark large datasets as reference-only observables
      oneOnOneData: observable.ref,
      oneOnOneMaxSnapshotMap: observable.ref,
      oneOnOneSeasonSnapshotsMap: observable.ref,
      oneOnOneSeasonFinalRankingMap: observable.ref,

      baseData: observable.ref,
      baseMaxSnapshotMap: observable.ref,
      baseSeasonSnapshotsMap: observable.ref,
      baseSeasonFinalRankingMap: observable.ref,

      // Actions
      loadOneOnOneData: action,
      loadBaseData: action,
      clearOneOnOneData: action,
      clearBaseData: action,
      resetLargeObjects: action,
    });
  }

  loadOneOnOneHallOfFameData() {
  if (!this.oneOnOneHallOfFameLoaded) {
    // Flush Base data before downloading 1v1 data to keep mobile memory low
    this.clearBaseData();

    fetch('https://storage.googleapis.com/leaderboard_files/exported_csvs/oneOnOne_appearances_brackets.csv')
      .then((response) => response.text()) // Convert Response to raw CSV string
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              let processedData = results.data;
              runInAction(() => {
                // Update MobX observables here
                this.oneOnOneFinishes = [];
                this.oneOnOneFinishes.push(processedData.filter(d => d.bracket === 'Top 1'));
                this.oneOnOneFinishes.push(processedData.filter(d => d.bracket === 'Top 5'));
                this.oneOnOneFinishes.push(processedData.filter(d => d.bracket === 'Top 10'));
                this.oneOnOneFinishes.push(processedData.filter(d => d.bracket === 'Top 100'));
              });
              // Get highest skill ratings
              fetch('https://storage.googleapis.com/leaderboard_files/exported_csvs/oneOnOne_highest_skill_ratings.csv')
              .then((response) => response.text()) // Convert Response to raw CSV string
              .then((csvText) => {
                Papa.parse(csvText, {
                          header: true,
                          skipEmptyLines: true,
                          complete: (results) => {
                              try {
                                let processedData = results.data;
                                runInAction(() => {
                                // Update MobX observables here
                                this.oneOnOnePeakSkillRatings = processedData;
                                // Get Time in First
                                fetch('https://storage.googleapis.com/leaderboard_files/exported_csvs/oneOnOne_time_in_rank_brackets.csv')
                                .then((response) => response.text()) // Convert Response to raw CSV string
                                .then((csvText) => {
                                  Papa.parse(csvText, {
                                            header: true,
                                            skipEmptyLines: true,
                                            complete: (results) => {
                                                try {
                                                  let processedData = results.data;
                                                  runInAction(() => {
                                                  // Update MobX observables here
                                                  this.oneOnOneTimeIn = [];
                                                  this.oneOnOneTimeIn.push(processedData.filter(d => d.bracket === 'Top 1'));
                                                  this.oneOnOneTimeIn.push(processedData.filter(d => d.bracket === 'Top 5'));
                                                  this.oneOnOneTimeIn.push(processedData.filter(d => d.bracket === 'Top 10'));
                                                  this.oneOnOneTimeIn.push(processedData.filter(d => d.bracket === 'Top 100'));

                                                  fetch('https://storage.googleapis.com/leaderboard_files/exported_csvs/oneOnOne_winrate_brackets.csv')
                                                    .then((response) => response.text()) // Convert Response to raw CSV string
                                                    .then((csvText) => {
                                                      Papa.parse(csvText, {
                                                                header: true,
                                                                skipEmptyLines: true,
                                                                complete: (results) => {
                                                                    try {
                                                                      let processedData = results.data;
                                                                      runInAction(() => {
                                                                      // Update MobX observables here
                                                                      this.oneOnOneWinRates = [];
                                                                      this.oneOnOneWinRates.push(processedData.filter(d => d.bracket === '75+ Games'));
                                                                      this.oneOnOneWinRates.push(processedData.filter(d => d.bracket === '100+ Games'));
                                                                      this.oneOnOneWinRates.push(processedData.filter(d => d.bracket === '200+ Games'));
                                                                      this.oneOnOneWinRates.push(processedData.filter(d => d.bracket === '500+ Games'));
                                                                    });
                                                                    } catch (error){
                                                                      console.error('Oops, error processing CSV data:', error);
                                                                    }
                                                                }}
                                                              )

                                                    })
                                                });
                                                } catch (error){
                                                  console.error('Oops, error processing CSV data:', error);
                                                }
                                            }}
                                          )

                                })
                              });
                              } catch (error){
                                console.error('Oops, error processing CSV data:', error);
                              }
                          }}
                        )

              })

            } catch (error) {
              console.error('Oops, error processing CSV data:', error);
            }
          },
          error: (error) => {
            console.error(`Error parsing CSV file: ${error}`);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading OneOnOne data:", error);
      });

    this.oneOnOneHallOfFameLoaded = true;
  }
}

  loadOneOnOneData() {
    if (this.oneOnOneData === null) {
      // Flush Base data before downloading 1v1 data to keep mobile memory low
      this.clearBaseData();

      readDataFromFile('https://storage.googleapis.com/leaderboard_files/exported_csvs/oneOnOne_all_data.csv', false, false)
        .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap}) => {
          runInAction(() => {
            this.oneOnOneData = fileData;
            this.oneOnOneMaxSnapshotMap = fileMaxSnapshotMap;
            this.oneOnOneSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
          });
        })
        .catch((error) => {
          console.error("Error loading OneOnOne data:", error);
        });
    }
  }

  loadBaseData() {
    if (this.baseData === null) {
      // Flush 1v1 data before downloading Base data to keep mobile memory low
      this.clearOneOnOneData();

      readDataFromFile('https://storage.googleapis.com/leaderboard_files/exported_csvs/base_all_data.csv', false, false)
        .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap }) => {
          runInAction(() => {
            this.baseData = fileData;
            this.baseMaxSnapshotMap = fileMaxSnapshotMap;
            this.baseSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
          });
        })
        .catch((error) => {
          console.error("Error loading Base data:", error);
        });
    }
  }

  loadFinalRanking(type) {
    // Use _final_rankings.csv (plural) to match the Cloud Function export
    const query = `https://storage.googleapis.com/leaderboard_files/exported_csvs/${type}_final_rankings.csv`;

    // Map each mode type directly to its MobX store property name
    const mapKeyByMode = {
      oneOnOne: 'oneOnOneSeasonFinalRankingMap',
      base: 'baseSeasonFinalRankingMap',
      rush: 'rushSeasonFinalRankingMap',
      ck: 'ckSeasonFinalRankingMap'
    };

    const targetProperty = mapKeyByMode[type];

    // Only fetch if valid mode and state is not yet loaded
    if (targetProperty && this[targetProperty] === null) {
      readDataFromFile(query, false, true)
        .then(({fileSeasonFinalRankingMap}) => {
          runInAction(() => {
            // Dynamically assign the loaded data to the correct store property
            this[targetProperty] = fileSeasonFinalRankingMap;
          });
        })
        .catch((error) => {
          console.error(`Error loading data from ${query}:`, error);
        });
    }
  }


  clearOneOnOneData() {
    this.oneOnOneData = null;
    this.oneOnOneMaxSnapshotMap = null;
    this.oneOnOneSeasonSnapshotsMap = null;
    this.oneOnOneSeasonFinalRankingMap = null;
  }

  clearBaseData() {
    this.baseData = null;
    this.baseMaxSnapshotMap = null;
    this.baseSeasonSnapshotsMap = null;
    this.baseSeasonFinalRankingMap = null;
  }

  resetLargeObjects() {
    this.clearOneOnOneData();
    this.clearBaseData();
  }
}

const store = new Store();
export default store;