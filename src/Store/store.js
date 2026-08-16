import { makeAutoObservable, runInAction } from 'mobx';
import {
    readDataFromFile
  } from '../utils/importDataUtils';

class Store {
  oneOnOneData = null;
  baseData = null;
  oneOnOneMaxSnapshotMap = null;
  baseMaxSnapshotMap = null;
  oneOnOneSeasonSnapshotsMap = null;
  baseSeasonSnapshotsMap = null;
  oneOnOneSeasonFinalRankingMap = null;
  baseSeasonFinalRankingMap = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadOneOnOneData() {
    if (this.oneOnOneData === null) {
      this.clearBaseData();

      readDataFromFile('https://storage.googleapis.com/leaderboard_files/csvs/leaderboards_oneOnOne.csv')
        .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap, fileSeasonFinalRankingMap }) => {
            runInAction(() => {
                this.oneOnOneData = fileData;
                this.oneOnOneMaxSnapshotMap = fileMaxSnapshotMap;
                this.oneOnOneSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
                this.oneOnOneSeasonFinalRankingMap = fileSeasonFinalRankingMap;
            })
        })
        .catch((error) => {
          console.error("Error loading OneOnOne data:", error);
        });
    }
  }
  
  loadBaseData() {
    if (this.baseData === null) {
      this.clearOneOnOneData();

        readDataFromFile('https://storage.googleapis.com/leaderboard_files/csvs/leaderboards_base.csv')
            .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap, fileSeasonFinalRankingMap }) => {
            runInAction(() => {
                this.baseData = fileData;
                this.baseMaxSnapshotMap = fileMaxSnapshotMap;
                this.baseSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
                this.baseSeasonFinalRankingMap = fileSeasonFinalRankingMap;
            })
        })
        .catch((error) => {
          console.error("Error loading Base data:", error);
        });
    }
  }

  clearOneOnOneData() {
    runInAction(() => {
      this.oneOnOneData = null;
      this.oneOnOneMaxSnapshotMap = null;
      this.oneOnOneSeasonSnapshotsMap = null;
    });
  }

  clearBaseData() {
    runInAction(() => {
      this.baseData = null;
      this.baseMaxSnapshotMap = null;
      this.baseSeasonSnapshotsMap = null;
    });
  }

  // Optional: Reset the objects
  resetLargeObjects() {
    this.oneOnOneData = null;
    this.baseData = null;
  }
}

const store = new Store();
export default store;
