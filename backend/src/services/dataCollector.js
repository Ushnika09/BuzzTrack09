// server/src/services/dataCollector.js
import config from '../config/config.js';
import { mentionStore } from '../models/Mention.js';
import { fetchRedditMentions } from '../sources/reddit.js';
import { fetchNewsMentions } from '../sources/newsAPI.js';
import { detectSpikes } from './spikeDetector.js';

// Track which brands are being monitored
const trackedBrands = new Set(['Nike', 'Apple', 'Tesla']); // Default brands
const collectionIntervals = new Map();

/**
 * Start data collection for all tracked brands
 */
export function startDataCollection() {
  console.log('🔄 Starting data collection service...');
  
  trackedBrands.forEach(brand => {
    startBrandCollection(brand);
  });

  console.log(`📊 Now tracking: ${Array.from(trackedBrands).join(', ')}`);
}

/**
 * Start collecting data for a specific brand
 */
export function startBrandCollection(brand) {
  if (collectionIntervals.has(brand)) {
    console.log(`⚠️  Already collecting data for ${brand}`);
    return;
  }

  console.log(`✅ Started tracking: ${brand}`);

  // Collect immediately
  collectBrandData(brand);

  // Set up recurring collection
  const interval = setInterval(() => {
    collectBrandData(brand);
  }, config.intervals.reddit); // Use shortest interval

  collectionIntervals.set(brand, interval);
}

/**
 * Stop collecting data for a brand
 */
export function stopBrandCollection(brand) {
  if (collectionIntervals.has(brand)) {
    clearInterval(collectionIntervals.get(brand));
    collectionIntervals.delete(brand);
    trackedBrands.delete(brand);
    console.log(`🛑 Stopped tracking: ${brand}`);
  }
}

/**
 * Collect data from all sources for a brand
 */
async function collectBrandData(brand) {
  console.log(`🔍 Collecting data for ${brand}...`);

  try {
    const results = await Promise.allSettled([
      fetchRedditMentions(brand, 15),
      fetchNewsMentions(brand, 10)
    ]);

    let totalMentions = 0;
    let newMentions = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const mentions = result.value;
        totalMentions += mentions.length;

        // Add to store and track new ones
        mentions.forEach(mention => {
          // Check if mention already exists (avoid duplicates)
          if (!isDuplicate(mention)) {
            mentionStore.add(mention);
            newMentions.push(mention);
          }
        });
      } else {
        console.error(`Source ${index} failed:`, result.reason);
      }
    });

    console.log(`📥 Collected ${totalMentions} total mentions (${newMentions.length} new) for ${brand}`);

    // Emit new mentions via WebSocket
    if (newMentions.length > 0 && global.io) {
      newMentions.forEach(mention => {
        global.io.to(brand).emit('new-mention', mention.toJSON());
      });
    }

    // Check for spikes
    const spike = detectSpikes(brand);
    if (spike.detected && global.io) {
      global.io.to(brand).emit('spike-alert', spike);
      console.log(`🚨 Spike alert sent for ${brand}`);
    }

  } catch (error) {
    console.error(`Error collecting data for ${brand}:`, error.message);
  }
}

/**
 * Check if mention is duplicate (same content from same source)
 */
function isDuplicate(newMention) {
  const existing = mentionStore.getAll({
    brand: newMention.brand,
    source: newMention.source
  });

  return existing.some(m => 
    m.url === newMention.url || 
    (m.content === newMention.content && m.platform === newMention.platform)
  );
}

/**
 * Add a new brand to track
 */
export function addBrand(brand) {
  if (trackedBrands.has(brand)) {
    return { success: false, message: 'Brand already being tracked' };
  }

  trackedBrands.add(brand);
  startBrandCollection(brand);

  return { 
    success: true, 
    message: `Started tracking ${brand}`,
    trackedBrands: Array.from(trackedBrands)
  };
}

/**
 * Remove a brand from tracking
 */
export function removeBrand(brand) {
  if (!trackedBrands.has(brand)) {
    return { success: false, message: 'Brand not being tracked' };
  }

  stopBrandCollection(brand);

  return { 
    success: true, 
    message: `Stopped tracking ${brand}`,
    trackedBrands: Array.from(trackedBrands)
  };
}

/**
 * Get list of tracked brands
 */
export function getTrackedBrands() {
  return Array.from(trackedBrands);
}

/**
 * Manually trigger collection for a brand
 */
export async function triggerCollection(brand) {
  if (!trackedBrands.has(brand)) {
    throw new Error('Brand not being tracked');
  }

  await collectBrandData(brand);
  return { success: true, message: 'Collection triggered' };
}

/**
 * Stop all data collection
 */
export function stopAllCollection() {
  collectionIntervals.forEach((interval, brand) => {
    clearInterval(interval);
    console.log(`🛑 Stopped tracking: ${brand}`);
  });

  collectionIntervals.clear();
  console.log('🛑 All data collection stopped');
}

// Cleanup on process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down data collection...');
  stopAllCollection();
  process.exit(0);
});