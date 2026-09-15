const cheerio = require('cheerio');
const axios = require('axios');

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};
const HEADERS = { ...BASE_HEADERS, 'Referer': 'https://www.codechef.com/' };
const LEETCODE_HEADERS = { ...BASE_HEADERS, 'Referer': 'https://leetcode.com/' };

async function fetchWithRetry(url, opts = {}, maxRetries = 2, timeoutMs = 5000) {
  for (let i = 0; i <= maxRetries; i++) {
    try { return await axios.get(url, { ...opts, headers: { ...HEADERS, ...(opts.headers || {}) }, timeout: timeoutMs }); }
    catch (e) { if (i === maxRetries || (e.response && e.response.status >= 400 && e.response.status < 500)) throw e; await new Promise(r => setTimeout(r, 1000)); }
  }
}
const mongoose = require('mongoose');
const Contest = require('../models/Contest');

const removeSpecialCharacters = (str) => {
  return str.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
};

const convertTimeToMilliseconds = (timeString) => {
  const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
};


function getStartOnDate(inputDate) {
  inputDate = new Date(inputDate);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDay = String(inputDate.getDate()).padStart(2, '0');
  const formattedDate =
    `${formattedDay} ${months[inputDate.getMonth()]} ${inputDate.getFullYear()} ${days[inputDate.getDay()]} ` +
    `${String(inputDate.getHours()).padStart(2, '0')}:${String(inputDate.getMinutes()).padStart(2, '0')}`;
  return formattedDate;
}

const calculateTime = (duration) => {
  const totalSeconds = Math.floor(duration / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

  let result = '';
  if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `;
  if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
  if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (!result) result += '< minute';

  return result.trim();
}

async function getContestsFromPlatforms() {
  let contests = [];

  // Leetcode — GraphQL (verified, avoids 403)
  try {
    const resp = await axios.post('https://leetcode.com/graphql',
      { query: 'query { allContests { title titleSlug startTime duration } }' },
      { headers: { 'Content-Type': 'application/json', 'User-Agent': 'CP-Dashboard-Backend/1.0', 'Referer': 'https://leetcode.com/' }, timeout: 15000, responseType: 'json', maxRedirects: 5 }
    );
    if (resp.data && !resp.data.errors && resp.data.data && Array.isArray(resp.data.data.allContests)) {
      resp.data.data.allContests.forEach((c) => {
        if (c && c.title && c.titleSlug && c.startTime && new Date(c.startTime * 1000) > new Date()) {
          contests.push({
            name: c.title,
            startTime: c.startTime ? new Date(c.startTime*1000).toISOString() : '',
            startsOn: c.startTime ? getStartOnDate(new Date(c.startTime*1000).toISOString()) : '',
            duration: c.duration ? calculateTime(c.duration * 1000) : '',
            url: `https://leetcode.com/contest/${c.titleSlug}/`,
            platform: 'leetcode'
          });
        }
      });
    }
  } catch (error) { console.error('Error fetching LeetCode contests:', error.message || error); }

  // Codeforces — official API (verified)
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list?gym=false&official=true', { timeout: 15000, headers: { 'User-Agent': 'CP-Dashboard-Backend/1.0' } });
    if (response.data && response.data.status === 'OK' && Array.isArray(response.data.result)) {
      response.data.result.forEach((c) => {
        if (c && c.id != null && c.name && c.startTimeSeconds && new Date(c.startTimeSeconds * 1000) > new Date()) {
          contests.push({
            name: c.name,
            startTime: c.startTimeSeconds ? new Date(c.startTimeSeconds * 1000).toISOString() : '',
            startsOn: c.startTimeSeconds ? getStartOnDate(new Date(c.startTimeSeconds * 1000).toISOString()) : '',
            duration: c.durationSeconds ? calculateTime(c.durationSeconds * 1000) : '',
            url: `https://codeforces.com/contest/${c.id}`,
            platform: 'codeforces'
          });
        }
      });
    }
  } catch (error) { console.error('Error fetching Codeforces contests:', error.message || error); }
  // Atcoder
  try {
    const response = await axios.get('https://atcoder.jp/contests/');
    const $ = cheerio.load(response.data);
    $('#contest-table-action .table-default tbody tr').each((index, element) => {
      const columns = $(element).find('td');
      let startTime = new Date($(columns[0]).text());
      startTime.setMinutes(startTime.getMinutes() - startTime.getTimezoneOffset());
      startTime = startTime.toISOString().replace(/\.\d+Z$/, '');
      const startsOn = getStartOnDate(startTime);
      const name = removeSpecialCharacters($(columns[1]).text().trim());
      const url = "https://atcoder.jp" + $(columns[1]).find('a').attr('href');
      const duration = calculateTime(convertTimeToMilliseconds($(columns[2]).text()));
      contests.push({ name, startTime, startsOn, duration, url, platform: 'atcoder' });
    });
    $('#contest-table-upcoming .table-default tbody tr').each((index, element) => {
      const columns = $(element).find('td');
      let startTime = new Date($(columns[0]).text());
      startTime.setMinutes(startTime.getMinutes() - startTime.getTimezoneOffset());
      startTime = startTime.toISOString().replace(/\.\d+Z$/, '');
      const startsOn = getStartOnDate(startTime);
      const name = removeSpecialCharacters($(columns[1]).text().trim());
      const url = "https://atcoder.jp" + $(columns[1]).find('a').attr('href');
      const duration = calculateTime(convertTimeToMilliseconds($(columns[2]).text()));
      contests.push({ name, startTime, startsOn, duration, url, platform: 'atcoder' });
    });
    $('#contest-table-permanent .table-default tbody tr').each((index, element) => {
      const columns = $(element).find('td');
      const startTime = new Date(new Date("01 January 2022").toLocaleString("en-US", { timeZone: 'Asia/Kolkata' })).toISOString().replace(/\.\d+Z$/, '');
      const startsOn = getStartOnDate(startTime);
      const name = removeSpecialCharacters($(columns[0]).text().trim());
      const url = "https://atcoder.jp" + $(columns[0]).find('a').attr('href');
      const duration = 'Infinite';
      contests.push({ name, startTime, startsOn, duration, url, platform: 'atcoder' });
    });
  } catch (error) {
    console.error('Error fetching AtCoder contests:', error.message);
  }

  // CodeChef — verified endpoint (200 JSON, future/past/practice)
  try {
    const ccResp = await fetchWithRetry('https://www.codechef.com/api/list/contests/all', { headers: { 'Accept': 'application/json' } });
    // axios already parses JSON — only parse when the payload is a raw string
    const $cc = typeof ccResp.data === 'string' ? JSON.parse(ccResp.data) : ccResp.data;
    const groups = ['future_contests', 'present_contests', 'past_contests'];
    groups.forEach((group) => {
      if ($cc[group] && Array.isArray($cc[group])) {
        $cc[group].forEach((item) => {
          if (item && item.contest_name) {
            // Skip contests that have already ended — no need to store them
            const endIso = item.contest_end_date_iso || item.contest_start_date_iso;
            if (endIso && new Date(endIso).getTime() < Date.now()) return;
            contests.push({
              name: item.contest_name,
              startTime: item.contest_start_date_iso ? new Date(item.contest_start_date_iso).toISOString() : '',
              startsOn: item.contest_start_date_iso ? getStartOnDate(new Date(item.contest_start_date_iso).toISOString()) : '',
              duration: item.contest_duration ? calculateTime(parseInt(item.contest_duration) * 60000) : '',
              url: item.contest_code ? `https://www.codechef.com/contests/${item.contest_code}` : 'https://www.codechef.com/contests',
              platform: 'codechef'
            });
          }
        });
      }
    });
  } catch (e) { console.error('Error fetching CodeChef contests:', e.message || e); }
  return contests;
}

let isLocked = false;
async function scrapeContests() {
  if (isLocked) { console.log('Cron overlap blocked'); return; }
  isLocked = true;
  try {
    const contests = await getContestsFromPlatforms();
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (contests && contests.length > 0) {
        await Contest.deleteMany({}, { session });
        await Contest.insertMany(contests, { session });
        await session.commitTransaction();
        console.log("Contest fetched (atomic), inserted:", contests.length);
      } else {
        await session.abortTransaction();
        console.log("Contest scrape skipped: empty/invalid result, preserving existing data");
      }
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error scraping contests:', error);
  } finally {
    isLocked = false;
  }
}

module.exports = scrapeContests;