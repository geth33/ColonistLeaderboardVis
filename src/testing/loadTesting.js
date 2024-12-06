import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 20, // 100 requests per second (simulate 200 concurrent users)
            timeUnit: '1s',
            duration: '30s', // Run for 1 minute
            preAllocatedVUs: 50, // Pre-allocate 50 VUs
            maxVUs: 50, // Allow up to 200 VUs
        },
    },
};

export default function () {
    // Step 1: Visit the home page
    let res = http.get('http://34.8.141.205/leaderboards_oneOnOne.csv');
    check(res, { 'status is 200': (r) => r.status === 200 });

    // // Step 2: Visit the FAQ page
    // res = http.get('https://leaderboardvisualizer.com/faq');
    // check(res, { 'status is 200': (r) => r.status === 200 });

    sleep(1); // Simulate a 1-second pause between actions
}
