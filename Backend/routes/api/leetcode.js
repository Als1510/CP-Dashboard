const express = require('express');
const axios = require('axios');
const router = express.Router();
const profileService = require('../../services/profileService');

const GRAPHQL_URL = 'https://leetcode.com/graphql';
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'CP-Dashboard-Backend/1.0'
};
const TIMEOUT = 15000;

function buildFailure(details) {
  return { status: 'Failed', details: String(details || 'Unknown error') };
}

function normalizeUsername(u) {
  return (u || '').trim().toLowerCase();
}

async function postGraphQL(query, variables) {
  const resp = await axios.post(
    GRAPHQL_URL,
    { query, variables },
    { headers: HEADERS, timeout: TIMEOUT, responseType: 'json', maxRedirects: 5 }
  );
  if (resp.status >= 400) {
    const msg = resp.status === 403 ? 'Access denied (403)' : resp.status === 429 ? 'Rate limited (429)' : `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  const data = resp.data;
  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error('GraphQL error: ' + data.errors.map(e => e.message || JSON.stringify(e)).join('; '));
  }
  return data;
}

// Existing profile parser — preserved exactly, extracted to reusable function
async function fetchLeetCodeProfile(username) {
  const query = `
    query getUserProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
          starRating
          userAvatar
        }
      }
    }
  `;
  const result = await postGraphQL(query, { username });
  if (!result || typeof result.data !== 'object') {
    const err = new Error('Invalid response structure from LeetCode');
    err.statusCode = 502;
    throw err;
  }
  const matchedUser = result.data.matchedUser;
  if (matchedUser === null || matchedUser === undefined) {
    const err = new Error('No LeetCode user found with username: ' + username);
    err.statusCode = 404;
    throw err;
  }
  return {
    status: 'OK',
    allQuestionsCount: result.data.allQuestionsCount || [],
    matchedUser: {
      submitStats: matchedUser.submitStats || null,
      profile: matchedUser.profile || null
    }
  };
}

function translateFetchError(err, username) {
  const msg = err.message || 'Unexpected error';
  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) return { status: 'Failed', details: 'LeetCode request timed out' };
  if (msg.includes('403') || msg.includes('Access denied')) return { status: 'Failed', details: 'LeetCode access denied' };
  if (msg.includes('429') || msg.includes('Rate limited')) return { status: 'Failed', details: 'LeetCode rate limited' };
  if (msg.includes('GraphQL error')) return { status: 'Failed', details: msg };
  return { status: 'Failed', details: msg };
}

function getStatusForError(err) {
  const msg = err.message || '';
  if (err.statusCode) return err.statusCode;
  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) return 504;
  if (msg.includes('403') || msg.includes('Access denied')) return 403;
  if (msg.includes('429') || msg.includes('Rate limited')) return 429;
  if (msg.includes('GraphQL error')) return 502;
  return 500;
}

// GET: stored profile first; GraphQL fetch only on cache miss
router.get('/:username', async (req, res) => {
  const username = normalizeUsername(req.params.username);
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const stored = await profileService.getProfile('leetcode', username);
    if (stored) {
      return res.json(stored.payload_json);
    }
    const payload = await fetchLeetCodeProfile(username);
    await profileService.saveProfile('leetcode', username, payload);
    return res.json(payload);
  } catch (err) {
    const code = getStatusForError(err);
    return res.status(code).json(translateFetchError(err, username));
  }
});

// POST refresh: always fetch upstream; save on success; no save on failure
router.post('/:username/refresh', async (req, res) => {
  const username = normalizeUsername(req.params.username);
  if (!username) return res.status(400).json(buildFailure('Username is required'));
  try {
    const payload = await fetchLeetCodeProfile(username);
    await profileService.saveProfile('leetcode', username, payload);
    return res.json(payload);
  } catch (err) {
    const code = getStatusForError(err);
    return res.status(code).json(translateFetchError(err, username));
  }
});

// Recent submissions — current caller does not specify limit; use sensible default 20
router.get('/:username/submissions', async (req, res) => {
  const username = normalizeUsername(req.params.username);
  if (!username) return res.status(400).json(buildFailure('Username is required'));

  const query = `
    query getRecentSubmissionList($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
        __typename
      }
    }
  `;

  try {
    const result = await postGraphQL(query, { username, limit: 20 });
    if (!result || typeof result.data !== 'object') {
      return res.status(502).json(buildFailure('Invalid response structure from LeetCode'));
    }
    const submissions = (result.data && result.data.recentSubmissionList) ? result.data.recentSubmissionList : [];
    return res.json({ status: 'OK', recentSubmissionList: submissions });
  } catch (err) {
    const msg = err.message || 'Unexpected error';
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) return res.status(504).json(buildFailure('LeetCode request timed out'));
    if (msg.includes('403') || msg.includes('Access denied')) return res.status(403).json(buildFailure('LeetCode access denied'));
    if (msg.includes('429') || msg.includes('Rate limited')) return res.status(429).json(buildFailure('LeetCode rate limited'));
    if (msg.includes('GraphQL error')) return res.status(502).json(buildFailure(msg));
    return res.status(500).json(buildFailure(msg));
  }
});

module.exports = router;
