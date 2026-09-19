import { makeAutoObservable, runInAction } from 'mobx';
import { readDataFromFile } from '../utils/importDataUtils';
import Papa from 'papaparse';

const BASE_URL = 'https://storage.googleapis.com/leaderboard_files/exported_csvs';

// Utility helper to fetch and parse CSV into a Promise
const fetchAndParseCsv = async (fileName) => {
  const response = await fetch(`${BASE_URL}/${fileName}`);
  const csvText = await response.text();
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
};

// Helper to split array items into bracket buckets
const groupByBrackets = (data, brackets) => 
  brackets.map(bracket => data.filter(d => d.bracket === bracket));

class Store {
  // Observables
  oneOnOneData = null;
  oneOnOneMaxSnapshotMap = null;
  oneOnOneSeasonSnapshotsMap = null;
  oneOnOneSeasonFinalRankingMap = null;

  oneOnOneHallOfFameLoaded = false;
  oneOnOneRatingRecords = null;
  oneOnOneWinRates = null;
  oneOnOneFinishes = null;
  oneOnOnePeakSkillRatings = null;
  oneOnOneTimeIn = null;

  baseData = null;
  baseMaxSnapshotMap = null;
  baseSeasonSnapshotsMap = null;
  baseSeasonFinalRankingMap = null;

  baseHallOfFameLoaded = false;
  baseRatingRecords = null;
  baseWinRate75Games = null;
  baseWinRate100Games = null;
  baseWinRate200Games = null;
  baseWinRate500Games = null;
  baseFinishesTop1 = null;
  baseFinishesTop5 = null;
  baseFinishesTop10 = null;
  baseFinishesTop100 = null;
  basePeakSkillRatings = null;
  baseTimeInTop1 = null;
  baseTimeInTop5 = null;
  baseTimeInTop10 = null;
  baseTimeInTop100 = null;

  constructor() {
    // makeAutoObservable automatically sets up actions and observable.ref for non-primitive fields
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadOneOnOneHallOfFameData() {
    if (this.oneOnOneHallOfFameLoaded) return;

    this.clearBaseData();

    try {
      // Load all 4 CSV files in parallel
      const [appearances, peakRatings, timeInRank, winrates] = await Promise.all([
        fetchAndParseCsv('oneOnOne_appearances_brackets.csv'),
        fetchAndParseCsv('oneOnOne_highest_skill_ratings.csv'),
        fetchAndParseCsv('oneOnOne_time_in_rank_brackets.csv'),
        fetchAndParseCsv('oneOnOne_winrate_brackets.csv'),
      ]);

      const rankBrackets = ['Top 1', 'Top 5', 'Top 10', 'Top 100'];
      const winBrackets = ['75+ Games', '100+ Games', '200+ Games', '500+ Games'];

      runInAction(() => {
        this.oneOnOneFinishes = groupByBrackets(appearances, rankBrackets);
        this.oneOnOnePeakSkillRatings = peakRatings;
        this.oneOnOneTimeIn = groupByBrackets(timeInRank, rankBrackets);
        this.oneOnOneWinRates = groupByBrackets(winrates, winBrackets);
        this.oneOnOneHallOfFameLoaded = true;
      });
    } catch (error) {
      console.error('Error loading OneOnOne Hall of Fame data:', error);
    }
  }

  async loadBaseHallOfFameData() {
    if (this.baseHallOfFameLoaded) return;

    this.clearBaseData();

    try {
      // Load all 4 CSV files in parallel
      const [appearances, peakRatings, timeInRank, winrates] = await Promise.all([
        fetchAndParseCsv('base_appearances_brackets.csv'),
        fetchAndParseCsv('base_highest_skill_ratings.csv'),
        fetchAndParseCsv('base_time_in_rank_brackets.csv'),
        fetchAndParseCsv('base_winrate_brackets.csv'),
      ]);

      const rankBrackets = ['Top 1', 'Top 5', 'Top 10', 'Top 100'];
      const winBrackets = ['40+ Games', '80+ Games', '120+ Games', '200+ Games'];

      runInAction(() => {
        this.baseFinishes = groupByBrackets(appearances, rankBrackets);
        this.basePeakSkillRatings = peakRatings;
        this.baseTimeIn = groupByBrackets(timeInRank, rankBrackets);
        this.baseWinRates = groupByBrackets(winrates, winBrackets);
        this.baseHallOfFameLoaded = true;
      });
    } catch (error) {
      console.error('Error loading Base Hall of Fame data:', error);
    }
  }

  async loadOneOnOneData() {
    if (this.oneOnOneData !== null) return;
    this.clearBaseData();

    try {
      const { fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap } = await readDataFromFile(
        `${BASE_URL}/oneOnOne_all_data.csv`, false, false
      );
      runInAction(() => {
        this.oneOnOneData = fileData;
        this.oneOnOneMaxSnapshotMap = fileMaxSnapshotMap;
        this.oneOnOneSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
      });
    } catch (error) {
      console.error('Error loading OneOnOne data:', error);
    }
  }

  async loadBaseData() {
    if (this.baseData !== null) return;
    this.clearOneOnOneData();

    try {
      const { fileData, fileMaxSnapshotMap, fileSeasonsSnapshotsMap } = await readDataFromFile(
        `${BASE_URL}/base_all_data.csv`, false, false
      );
      runInAction(() => {
        this.baseData = fileData;
        this.baseMaxSnapshotMap = fileMaxSnapshotMap;
        this.baseSeasonSnapshotsMap = fileSeasonsSnapshotsMap;
      });
    } catch (error) {
      console.error('Error loading Base data:', error);
    }
  }

  async loadFinalRanking(type) {
    const mapKeyByMode = {
      oneOnOne: 'oneOnOneSeasonFinalRankingMap',
      base: 'baseSeasonFinalRankingMap',
      rush: 'rushSeasonFinalRankingMap',
      ck: 'ckSeasonFinalRankingMap',
    };

    const targetProperty = mapKeyByMode[type];
    if (!targetProperty || this[targetProperty] !== null) return;

    const query = `${BASE_URL}/${type}_final_rankings.csv`;
    try {
      const { fileSeasonFinalRankingMap } = await readDataFromFile(query, false, true);
      runInAction(() => {
        this[targetProperty] = fileSeasonFinalRankingMap;
      });
    } catch (error) {
      console.error(`Error loading data from ${query}:`, error);
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