// server/src/utils/helpers.js

/**
 * Parse timeframe string to milliseconds
 */
export function parseTimeframe(timeframe) {
  const units = {
    'h': 3600000,    // hours
    'd': 86400000,   // days
    'w': 604800000   // weeks
  };
  
  const match = timeframe.match(/^(\d+)([hdw])$/);
  if (!match) return 86400000; // default 24h
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

/**
 * Get start date based on timeframe
 */
export function getTimeframeDate(timeframe = '24h') {
  const ms = parseTimeframe(timeframe);
  return new Date(Date.now() - ms).toISOString();
}

/**
 * Get dominant sentiment from counts
 */
export function getDominantSentiment(sentimentCounts) {
  if (!sentimentCounts) return 'neutral';
  
  const max = Math.max(sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative);
  if (max === sentimentCounts.positive) return 'positive';
  if (max === sentimentCounts.negative) return 'negative';
  return 'neutral';
}