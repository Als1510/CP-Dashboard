const express = require('express');
const axios = require('axios');
const router = express.Router();
const profileService = require('../../services/profileService');

const BASE = 'https://codeforces.com/api';
const HEADERS = { 'User-Agent': 'CP-Dashboard-Backend/1.0' };

function buildFailure(details) {
  return { status: 'Failed', details: String(details || 'Unknown error') };
}

function normalizeUsername(u) {
  return (u || '').trim().toLowerCase();
}

async function fetchUserInfo(handle) {
  const url = `${BASE}/user.info?handles=${encodeURIComponent(handle)}`;
  const resp = await axios.get(url, { headers: HEADERS, timeout: 10000, responseType: 'json' });
  if (resp.data && resp.data.status === 'OK') return resp.data;
  throw new Error('Codeforces API returned non-OK status');
}

async function fetchUserRating(handle) {
  const url = `${BASE}/user.rating?handle=${encodeURIComponent(handle)}`;
  const resp = await axios.get(url, { headers: HEADERS, timeout: 10000, responseType: 'json' });
  if (resp.data && resp.data.status === 'OK') return resp.data.result || [];
  return [];
}

// Existing parser logic — preserved exactly, extracted to reusable function
async function buildCodeforcesPayload(username) {
  const infoData = await fetchUserInfo(username);
  if (!infoData || !infoData.result || infoData.result.length === 0) {
    const err = new Error('No Codeforces user found with handle: ' + username);
    err.statusCode = 404;
    throw err;
  }
  const user = infoData.result[0];
  let contestRatings = [];
  try {
    const ratingData = await fetchUserRating(username);
    if (Array.isArray(ratingData)) {
      contestRatings = ratingData.map(r => ({
        name: r.contestName || '',
        rating: typeof r.newRating === 'number' ? r.newRating : (parseInt(r.newRating, 10) || 0),
        oldRating: typeof r.oldRating === 'number' ? r.oldRating : (parseInt(r.oldRating, 10) || 0),
        rank: typeof r.rank === 'number' ? r.rank : (parseInt(r.rank, 10) || 0),
        contestId: r.contestId || null,
        timestamp: r.ratingUpdateTimeSeconds || null
      })).filter(r => r.name);
    }
  } catch (e) { /* rating history optional */ }
  return {
    status: 'OK',
    user_details: {
      username: user.handle || username,
      name: (user.firstName || '') + (user.lastName ? ' ' + user.lastName : '') || username,
      image: user.avatar || user.titlePhoto || '',
      country: user.country || 'Not specified',
      organization: user.organization || '',
      institution: user.organization || ''
    },
    rating: typeof user.rating === 'number' ? user.rating : 'NA',
    maxRating: typeof user.maxRating === 'number' ? user.maxRating : 'NA',
    rank: user.rank || 'NA',
    maxRank: user.maxRank || 'NA',
    stars: '',
    div: '',
    color: '#666666',
    global_rank: user.rank ? String(user.rank) : 'NA',
    country_rank: 'NA',
    total_solved: 'NA',
    contest_ratings: contestRatings,
    fully_solved: { count: 'NA', 'Practice': [], 'CodeChef Starters': [], 'Long Challenge': [], 'Cook-Off': [], 'Lunchtime': [] },
    partially_solved: { count: 0, 'Practice': [], 'Starters': [], 'Long Challenge': [], 'Cook-Off': [], 'Lunchtime': [] }
  };
}

function translateFetchError(err, username) {
  if (err.response) {
    const status = err.response.status;
    if (status === 403) return { status: 'Failed', details: 'Access to Codeforces denied (403)' };
    if (status === 429) return { status: 'Failed', details: 'Codeforces rate limit exceeded (429)' };
    if (status >= 500) return { status: 'Failed', details: 'Upstream Codeforces server failure' };
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
    return { status: 'Failed', details: 'Network/transport failure connecting to Codeforces' };
  }
  return { status: 'Failed', details: 'Unexpected Codeforces response' };
}

function getStatusForError(err) {
  if (err.response) {
    const s = err.response.status;
    if (s === 403) return 403;
    if (s === 429) return 429;
    if (s >= 500) return 502;
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') return 503;
  return 500;
}

// GET: stored snapshot first; fetch only on cache miss
router.get('/:username', async (req, res) => {
  const username = normalizeUsername(req.params.username);
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const stored = await profileService.getProfile('codeforces', username);
    if (stored) {
      return res.json(stored.payload_json);
    }
    const payload = await buildCodeforcesPayload(username);
    await profileService.saveProfile('codeforces', username, payload);
    return res.json(payload);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json(buildFailure(err.message));
    const code = getStatusForError(err);
    return res.status(code).json(translateFetchError(err, username));
  }
});

// POST refresh: always upstream; update on success; preserve old data on failure
router.post('/:username/refresh', async (req, res) => {
  const username = normalizeUsername(req.params.username);
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const payload = await buildCodeforcesPayload(username);
    await profileService.saveProfile('codeforces', username, payload);
    return res.json(payload);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json(buildFailure(err.message));
    const code = getStatusForError(err);
    return res.status(code).json(translateFetchError(err, username));
  }
});

module.exports = router;