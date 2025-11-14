// server/src/services/spikeDetector.js
import config from '../config/config.js';
import { mentionStore } from '../models/Mention.js';

/**
 * Detect conversation spikes for a brand
 */
export function detectSpikes(brand) {
  const timeWindow = config.spikeDetection.timeWindow;
  const threshold = config.spikeDetection.threshold;
  const minMentions = config.spikeDetection.minMentions;

  const now = Date.now();
  const recentWindow = now - timeWindow;
  const previousWindow = recentWindow - timeWindow;

  // Get mentions in current window
  const recentMentions = mentionStore.getAll({
    brand,
    startDate: new Date(recentWindow).toISOString()
  });

  // Get mentions in previous window (for comparison)
  const previousMentions = mentionStore.getAll({
    brand,
    startDate: new Date(previousWindow).toISOString(),
    endDate: new Date(recentWindow).toISOString()
  });

  const recentCount = recentMentions.length;
  const previousCount = previousMentions.length || 1; // Avoid division by zero

  // Calculate spike ratio
  const spikeRatio = recentCount / previousCount;

  const isSpike = recentCount >= minMentions && spikeRatio >= threshold;

  if (isSpike) {
    return {
      detected: true,
      brand,
      currentCount: recentCount,
      previousCount,
      spikeRatio: spikeRatio.toFixed(2),
      increase: ((spikeRatio - 1) * 100).toFixed(1),
      timestamp: new Date().toISOString(),
      sentiment: calculateSpikeSentiment(recentMentions),
      topMentions: getTopMentions(recentMentions, 5),
      sources: getSourceBreakdown(recentMentions)
    };
  }

  return {
    detected: false,
    brand,
    currentCount: recentCount,
    previousCount,
    spikeRatio: spikeRatio.toFixed(2)
  };
}

/**
 * Calculate overall sentiment of spike mentions
 */
function calculateSpikeSentiment(mentions) {
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  let totalScore = 0;

  mentions.forEach(m => {
    sentimentCounts[m.sentiment]++;
    totalScore += m.sentimentScore;
  });

  const avgScore = mentions.length > 0 ? totalScore / mentions.length : 0;
  const dominant = Object.keys(sentimentCounts).reduce((a, b) => 
    sentimentCounts[a] > sentimentCounts[b] ? a : b
  );

  return {
    dominant,
    breakdown: sentimentCounts,
    avgScore: avgScore.toFixed(3)
  };
}

/**
 * Get top mentions by engagement
 */
function getTopMentions(mentions, limit = 5) {
  return mentions
    .sort((a, b) => {
      const aEngagement = a.engagement.likes + a.engagement.comments + a.engagement.shares;
      const bEngagement = b.engagement.likes + b.engagement.comments + b.engagement.shares;
      return bEngagement - aEngagement;
    })
    .slice(0, limit)
    .map(m => ({
      id: m.id,
      content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
      url: m.url,
      source: m.source,
      sentiment: m.sentiment,
      engagement: m.engagement
    }));
}

/**
 * Get source breakdown for spike
 */
function getSourceBreakdown(mentions) {
  const sources = {};

  mentions.forEach(m => {
    sources[m.source] = (sources[m.source] || 0) + 1;
  });

  return sources;
}

/**
 * Monitor for spikes across all tracked brands
 */
export function monitorAllBrands(trackedBrands) {
  const spikes = [];

  trackedBrands.forEach(brand => {
    const spike = detectSpikes(brand);
    if (spike.detected) {
      spikes.push(spike);
      console.log(`🚨 SPIKE DETECTED for ${brand}: ${spike.increase}% increase`);
    }
  });

  return spikes;
}

/**
 * Get spike history for a brand
 */
export function getSpikeHistory(brand, days = 7) {
  const timeWindow = days * 24 * 3600000; // days in milliseconds
  const now = Date.now();
  const startTime = now - timeWindow;

  // Get all mentions in time window
  const mentions = mentionStore.getAll({
    brand,
    startDate: new Date(startTime).toISOString()
  });

  // Group by hour
  const hourlyBuckets = new Map();

  mentions.forEach(m => {
    const hour = new Date(m.timestamp).setMinutes(0, 0, 0);
    const count = hourlyBuckets.get(hour) || 0;
    hourlyBuckets.set(hour, count + 1);
  });

  // Convert to array and sort
  const timeline = Array.from(hourlyBuckets.entries())
    .map(([timestamp, count]) => ({
      timestamp: new Date(timestamp).toISOString(),
      count
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Calculate average and identify spikes
  const avgCount = timeline.reduce((sum, t) => sum + t.count, 0) / timeline.length;
  
  timeline.forEach(t => {
    t.isSpike = t.count > avgCount * config.spikeDetection.threshold;
  });

  return {
    brand,
    period: `${days} days`,
    timeline,
    avgHourlyMentions: avgCount.toFixed(2),
    totalMentions: mentions.length
  };
}