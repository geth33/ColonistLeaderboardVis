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

  constructor() {
    makeAutoObservable(this);
  }

  loadOneOnOneData() {
    if (this.oneOnOneData === null) {
      readDataFromFile('/csvs/leaderboards_oneOnOne.csv')
        .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap }) => {
            runInAction(() => {
                this.oneOnOneData = fileData;
                this.oneOnOneMaxSnapshotMap = fileMaxSnapshotMap;
                this.oneOnOneSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
            })
        })
        .catch((error) => {
          console.error("Error loading OneOnOne data:", error);
        });
    }
  }
  
  loadBaseData() {
    if (this.baseData === null) {
      readDataFromFile('/csvs/leaderboards_base.csv')
        .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap }) => {
            runInAction(() => {
                this.baseData = fileData;
          this.baseMaxSnapshotMap = fileMaxSnapshotMap;
          this.baseSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
            })
        })
        .catch((error) => {
          console.error("Error loading Base data:", error);
        });
    }
  }

  // Optional: Reset the objects
  resetLargeObjects() {
    this.oneOnOneData = null;
    this.baseData = null;
  }
}

const store = new Store();
export default store;
