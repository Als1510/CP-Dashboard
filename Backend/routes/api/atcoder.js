const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const profileService = require('../../services/profileService');

const URL = 'https://atcoder.jp/users/';
const HEADERS = { 'User-Agent': 'CP-Dashboard-Backend/1.0' };
const TIMEOUT = 15000;

function buildFailure(details) {
  return { status: 'Failed', details: String(details || 'Unknown error') };
}

function normalizeUsername(u) {
  return (u || '').trim().toLowerCase();
}

function safeValue(val) {
  if (val === undefined || val === null || val === '') return 'NA';
  const s = String(val).trim();
  return s === '' ? 'NA' : s;
}

// Existing parser logic — preserved exactly, extracted to reusable function
async function fetchAtCoderProfile(username) {
  const response = await axios.get(URL + encodeURIComponent(username), {
    headers: HEADERS,
    timeout: TIMEOUT,
    responseType: 'text',
    maxRedirects: 5
  });
  const html = response.data || '';
  const $ = cheerio.load(html);
  const isNotFound = $('title').text().toLowerCase().includes('not found') ||
    $('div.alert-danger').length > 0 ||
    html.includes('No such user') ||
    html.includes('user not found');
  const errorText = $('div.alert-danger, .error, .notice').text().toLowerCase() || '';
  if (isNotFound || errorText.includes('not found') || errorText.includes('no such')) {
    const err = new Error('No AtCoder user found with username: ' + username);
    err.statusCode = 404;
    throw err;
  }
  let rating = 'NA';
  let highestRating = 'NA';
  let rank = 'NA';
  let level = 'NA';
  const tableRows = $('.dl-table tbody tr');
  tableRows.each((i, el) => {
    const row = $(el);
    const label = row.find('th').text().trim() || '';
    const value = row.find('td').text().trim() || '';
    const key = label.toLowerCase();
    if (key.includes('rating')) rating = safeValue(value);
    if (key.includes('highest')) highestRating = safeValue(value);
    if (key.includes('rank')) rank = safeValue(value);
    if (key.includes('level')) level = safeValue(value);
  });
  if (rating === 'NA') {
    // Try to extract from profile header meta (country/region, birth year)
    const profileMeta = $('.list-group-item, .d-flex, .atcoder-user-nav');
  }
  const country = safeValue($('.profile-country')?.text() || $('.user-place').text() || '');
  const birthYear = safeValue($('.birth-year, .user-birth').text() || '');
  const ratingEl = $('.col-md-9.col-sm-12 .dl-table tbody tr:nth-child(2) td span').first();
  if (ratingEl.length) rating = safeValue(ratingEl.text());
  if (highestRating === 'NA') {
    const maxEl = $('.col-md-9.col-sm-12 .dl-table tbody tr:nth-child(3) td span').first();
    if (maxEl.length) highestRating = safeValue(maxEl.text());
  }
  if (rank === 'NA') {
    const rankEl = $('.col-md-9.col-sm-12 .dl-table tbody tr:nth-child(1) td').first();
    if (rankEl.length) rank = safeValue(rankEl.text().replace(/[^\d]/g, ''));
  }
  return {
    status: 'OK',
    username: username,
    rating: rating,
    highest_rating: highestRating,
    rank: rank,
    level: level
  };
}

function translateFetchError(err, username) {
  const msg = err.message || 'Unexpected error';
  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) return { status: 'Failed', details: 'AtCoder request timed out' };
  if (msg.includes('403') || msg.includes('Access denied')) return { status: 'Failed', details: 'AtCoder access denied' };
  if (msg.includes('429') || msg.includes('Rate limited')) return { status: 'Failed', details: 'AtCoder rate limited' };
  if (msg.includes('404') || msg.includes('user not found') || msg.includes('No such')) return { status: 'Failed', details: 'No AtCoder user found with username: ' + username };
  if (msg.includes('ENOTFOUND') || msg.includes('Network Error')) return { status: 'Failed', details: 'Network error connecting to AtCoder' };
  return { status: 'Failed', details: msg };
}

function getStatusForError(err) {
  const msg = err.message || '';
  if (err.statusCode) return err.statusCode;
  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) return 504;
  if (msg.includes('403') || msg.includes('Access denied')) return 403;
  if (msg.includes('429') || msg.includes('Rate limited')) return 429;
  if (msg.includes('404') || msg.includes('user not found') || msg.includes('No such')) return 404;
  if (msg.includes('ENOTFOUND') || msg.includes('Network Error')) return 503;
  return 500;
}

// GET: stored profile first; fetch only on cache miss
router.get('/:username', async (req, res) => {
  const username = normalizeUsername(req.params.username);
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const stored = await profileService.getProfile('atcoder', username);
    if (stored) {
      return res.json(stored.payload_json);
    }
    const payload = await fetchAtCoderProfile(username);
    await profileService.saveProfile('atcoder', username, payload);
    return res.json(payload);
  } catch (err) {
    const code = getStatusForError(err);
    return res.status(code).json(translateFetchError(err, username));
  }
});

// POST refresh: always fetch upstream; save on success; preserve old data on failure
router.post('/:username/refresh', async (req, res) => {
  const username = normalizeUsername(req.params.username);
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const payload = await fetchAtCoderProfile(username);
    await profileService.saveProfile('atcoder', username, payload);
    return res.json(payload);
  } catch (err) {
    const code = getStatusForError(err);
    return res.status(code).json(translateFetchError(err, username));
  }
});

module.exports = router;