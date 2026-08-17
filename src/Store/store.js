import { makeObservable, observable, action, runInAction } from 'mobx';
import { readDataFromFile } from '../utils/importDataUtils';

class Store {
  // Use observable.ref to prevent MobX from deeply wrapping massive datasets
  oneOnOneData = null;
  oneOnOneMaxSnapshotMap = null;
  oneOnOneSeasonSnapshotsMap = null;
  oneOnOneSeasonFinalRankingMap = null;

  baseData = null;
  baseMaxSnapshotMap = null;
  baseSeasonSnapshotsMap = null;
  baseSeasonFinalRankingMap = null;

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

  loadOneOnOneData() {
    if (this.oneOnOneData === null) {
      // Flush Base data before downloading 1v1 data to keep mobile memory low
      this.clearBaseData();

      readDataFromFile('https://storage.googleapis.com/leaderboard_files/exported_csvs/oneOnOne_all_data.csv')
        .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap, fileSeasonFinalRankingMap }) => {
          runInAction(() => {
            this.oneOnOneData = fileData;
            this.oneOnOneMaxSnapshotMap = fileMaxSnapshotMap;
            this.oneOnOneSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
            this.oneOnOneSeasonFinalRankingMap = fileSeasonFinalRankingMap;
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

      readDataFromFile('https://storage.googleapis.com/leaderboard_files/exported_csvs/base_all_data.csv')
        .then(({ fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap, fileSeasonFinalRankingMap }) => {
          runInAction(() => {
            this.baseData = fileData;
            this.baseMaxSnapshotMap = fileMaxSnapshotMap;
            this.baseSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
            this.baseSeasonFinalRankingMap = fileSeasonFinalRankingMap;
          });
        })
        .catch((error) => {
          console.error("Error loading Base data:", error);
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