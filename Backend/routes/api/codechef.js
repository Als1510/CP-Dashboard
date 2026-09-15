// CodeChef profile endpoint — stored-profile + explicit-refresh architecture (Phase 5 pilot)
// Reuses existing parser; adds MongoDB persistence via profileService.
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const profileService = require('../../services/profileService');

class CodeChefUserNotFound extends Error {}
class CodeChefAccessDenied extends Error {}
class CodeChefRateLimited extends Error {}
class CodeChefServerError extends Error {}
class CodeChefTransportError extends Error {}
class CodeChefStructureError extends Error {}

const safeInt = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim();
  if (s === 'Inactive' || s.toLowerCase() === 'inactive') return 'NA';
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 'NA' : n;
};

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' };

function buildFailure(details) {
  return { status: 'Failed', details: String(details || 'Unknown error') };
}

// Existing parser logic — preserved exactly (extracted to reusable function)
async function fetchCodeChefProfile(username) {
  const url = 'https://www.codechef.com/users/' + encodeURIComponent(username);
  const response = await axios.get(url, { headers: HEADERS, timeout: 15000, responseType: 'text' });
  const html = response.data || '';
  if (html.includes('User not found') || html.includes('Could not find user')) {
    const err = new CodeChefUserNotFound('No CodeChef user found with handle: ' + username);
    err.statusCode = 404;
    throw err;
  }
  const $ = cheerio.load(html);
  const profile = $('.user-details-container');
  if (!profile || profile.length === 0) {
    const err = new CodeChefStructureError('Could not find profile data structure');
    err.statusCode = 500;
    throw err;
  }
  const name = $('h1.h2-style').first().text().trim() || $('h1').first().text().trim() || username;
  const image = profile.find('img').first().attr('src') || '';
  const currentRating = safeInt($('.rating-number').first().text().trim());
  const highestRating = safeInt($('.rating-number').first().parent().find('small').text().trim());
  let stars = $('.rating').first().text().trim() || '0★';
  let globalRank = 'NA';
  let countryRank = 'NA';
  const rankSection = $('.rating-ranks');
  if (rankSection.length) {
    const items = rankSection.find('.inline-list li');
    if (items.length >= 2) {
      const gText = $(items[0]).find('strong').first().text().trim();
      const cText = $(items[items.length - 1]).find('strong').first().text().trim();
      globalRank = safeInt(gText) === null ? 'NA' : safeInt(gText);
      countryRank = safeInt(cText) === null ? 'NA' : safeInt(cText);
    } else if (items.length === 1) {
      const txt = $(items[0]).find('strong').first().text().trim();
      globalRank = safeInt(txt) === null ? 'NA' : safeInt(txt);
      countryRank = 'NA';
    }
  }
  let country = $('.user-country-name').first().text().trim() || '';
  let totalSolved = 0;
  const solvedSection = $('.rating-data-section');
  if (solvedSection.length) {
    const lastH3 = solvedSection.find('h3').last();
    if (lastH3.length) {
      const parts = lastH3.text().trim().split(':');
      if (parts.length >= 2) {
        const countNum = parseInt(parts[1].trim().replace(/[^0-9]/g, ''), 10);
        totalSolved = isNaN(countNum) ? 0 : countNum;
      }
    }
  }
  const studentProfessional = $('li').filter((i, el) => $(el).find('label').text().includes('Student/Professional')).find('span').text().trim() || '';
  const institution = $('li').filter((i, el) => $(el).find('label').text().includes('Institution')).find('span').text().trim() || '';
  let div = '6';
  if (typeof currentRating === 'number') {
    if (currentRating >= 2200) div = '1';
    else if (currentRating >= 2000) div = '2';
    else if (currentRating >= 1800) div = '3';
    else if (currentRating >= 1600) div = '4';
    else if (currentRating >= 1400) div = '5';
  }
  let contestRatings = [];
  const scriptTags = $('script');
  scriptTags.each((i, el) => {
    const text = $(el).html() || '';
    if (text.indexOf('all_rating') !== -1) {
      try {
        // Source uses assignment syntax: all_rating = [{...}, ...]; handle both quoted key and assignment
        const assignMatch = text.match(/all_rating\s*=\s*(\[[\s\S]*?\])(?:;|\s*\n|$)/);
        if (assignMatch) {
          const parsedArr = JSON.parse(assignMatch[1]);
          if (Array.isArray(parsedArr)) {
            contestRatings = parsedArr.map(r => ({
              name: r.name || r.contest || '',
              rating: parseInt(r.rating || r.rating, 10) || 0,
              rank: r.rank || ''
            })).filter(r => r.name);
          }
        } else {
          const objMatch = text.match(/\{[\s\S]*?"all_rating"\s*:\s*(\[[\s\S]*?\])[\s\S]*?\}/);
          if (objMatch) {
            const parsed = JSON.parse(objMatch[1]);
            if (Array.isArray(parsed)) {
              contestRatings = parsed.map(r => ({ name: r.name || r.contest || '', rating: parseInt(r.rating || r.rating, 10) || 0, rank: r.rank || '' })).filter(r => r.name);
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse contest ratings from script tags:', e.message);
      }
    }
  });
  return {
    status: 'OK',
    user_details: {
      username: username,
      name: name || username,
      image: image,
      country: country || 'Not specified',
      student_professional: studentProfessional || '',
      institution: institution || ''
    },
    rating: (typeof currentRating === 'number') ? currentRating : 'NA',
    highest_rating: (typeof highestRating === 'number') ? highestRating : 'NA',
    stars: stars,
    div: div,
    color: '#666666',
    global_rank: globalRank,
    country_rank: countryRank,
    total_solved: totalSolved,
    contest_ratings: contestRatings,
    fully_solved: { count: totalSolved, 'Practice': [], 'CodeChef Starters': [], 'Long Challenge': [], 'Cook-Off': [], 'Lunchtime': [] },
    partially_solved: { count: 0, 'Practice': [], 'Starters': [], 'Long Challenge': [], 'Cook-Off': [], 'Lunchtime': [] }
  };
}

function translateFetchError(err, username) {
  if (err.response) {
    const status = err.response.status;
    if (status === 403) return { status: 'Failed', details: 'Access to CodeChef profile was denied (403)' };
    if (status === 429) return { status: 'Failed', details: 'CodeChef rate limit exceeded (429)' };
    if (status >= 500) return { status: 'Failed', details: 'Upstream CodeChef server failure' };
    if (status === 404) return { status: 'Failed', details: 'No CodeChef user found with handle: ' + username };
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
    return { status: 'Failed', details: 'Network/transport failure connecting to CodeChef' };
  }
  return { status: 'Failed', details: 'Profile structure error or unexpected upstream response' };
}

function getStatusForError(err) {
  if (err.response) {
    const s = err.response.status;
    if (s === 403) return 403;
    if (s === 429) return 429;
    if (s >= 500) return 502;
    if (s === 404) return 404;
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') return 503;
  return 500;
}

// GET: stored-profile first; fetch only on miss
router.get('/:username', async (req, res) => {
  const username = req.params.username ? req.params.username.trim() : '';
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const normalized = username.toLowerCase();
    const stored = await profileService.getProfile('codechef', normalized);
    if (stored) {
      // Return stored payload; do NOT expose MongoDB internals unless part of contract.
      // Existing response contract does not include last_fetched; keep it unchanged.
      return res.json(stored.payload_json);
    }
    // Cache miss → fetch upstream, persist, return fresh
    const payload = await fetchCodeChefProfile(normalized);
    await profileService.saveProfile('codechef', normalized, payload);
    return res.json(payload);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json(buildFailure(err.message));
    const code = getStatusForError(err);
    const fail = translateFetchError(err, username);
    return res.status(code).json(fail);
  }
});

// POST refresh: always upstream; update existing; preserve created_at on failure (no overwrite)
router.post('/:username/refresh', async (req, res) => {
  const username = req.params.username ? req.params.username.trim() : '';
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const normalized = username.toLowerCase();
    // Always fetch upstream (explicit refresh)
    const payload = await fetchCodeChefProfile(normalized);
    await profileService.saveProfile('codechef', normalized, payload);
    return res.json(payload);
  } catch (err) {
    // Critical failure requirement: if existing stored profile exists, leave untouched.
    // profileService.saveProfile is never called on failure, so MongoDB remains unchanged.
    if (err.statusCode) return res.status(err.statusCode).json(buildFailure(err.message));
    const code = getStatusForError(err);
    const fail = translateFetchError(err, username);
    return res.status(code).json(fail);
  }
});

module.exports = router;
