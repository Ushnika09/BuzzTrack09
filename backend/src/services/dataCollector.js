import config from '../config/config.js';
import { mentionStore } from '../models/Mention.js';
import { fetchRedditMentions } from '../sources/reddit.js';
import { fetchNewsMentions } from '../sources/newsAPI.js';
import { detectSpikes, monitorAllBrands } from './spikeDetector.js';

// Track which brands are being monitored
const trackedBrands = new Set(['Nike', 'Apple', 'Tesla']); // Default brands
const collectionIntervals = new Map();

/**
 * Start data collection for all tracked brands
 */
export function startDataCollection() {
  console.log('🔄 Starting data collection service...');
  console.log('🔧 Data Collector Config Check:');
  console.log('   News enabled:', config.sources.news.enabled);
  console.log('   Reddit enabled:', config.sources.reddit.enabled);
  
  // Clear old data on restart to avoid timestamp issues
  mentionStore.clear();
  console.log('🧹 Cleared previous mention data');
  
  trackedBrands.forEach(brand => {
    startBrandCollection(brand);
  });

  console.log(`📊 Now tracking: ${Array.from(trackedBrands).join(', ')}`);
  
  // Start spike monitoring
  startSpikeMonitoring();
}

/**
 * Start spike monitoring interval
 */
function startSpikeMonitoring() {
  // Check for spikes every 5 minutes
  setInterval(() => {
    const activeSpikes = monitorAllBrands(Array.from(trackedBrands));
    
    if (activeSpikes.length > 0 && global.io) {
      console.log(`🚨 Monitoring: Found ${activeSpikes.length} active spikes`);
      global.io.emit('spike-monitor-update', {
        timestamp: new Date().toISOString(),
        activeSpikes,
        totalBrands: trackedBrands.size
      });
    }
  }, config.intervals.spikeCheck || 300000); // 5 minutes default
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
      config.sources.reddit.enabled ? fetchRedditMentions(brand, 15) : Promise.resolve([]),
      config.sources.news.enabled ? fetchNewsMentions(brand, 10) : Promise.resolve([])
    ]);

    let totalMentions = 0;
    let newMentions = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const mentions = result.value;
        totalMentions += mentions.length;

        // Add to store and track new ones
        mentions.forEach(mention => {
          if (!isDuplicate(mention)) {
            mentionStore.add(mention);
            newMentions.push(mention);
          }
        });
      } else {
        console.error(`❌ Source ${index} failed for ${brand}:`, result.reason);
      }
    });

    console.log(`📥 Collected ${totalMentions} total mentions (${newMentions.length} new) for ${brand}`);

    // Emit new mentions via WebSocket
    if (newMentions.length > 0 && global.io) {
      newMentions.forEach(mention => {
        global.io.to(brand).emit('new-mention', mention.toJSON());
      });
      
      // Also emit batch update
      global.io.emit('mentions-batch', {
        brand,
        count: newMentions.length,
        mentions: newMentions.map(m => m.toJSON())
      });
    }

    // Enhanced spike detection with better logging
    console.log(`🔍 Checking for spikes for ${brand}...`);
    const spike = detectSpikes(brand);
    
    console.log(`📊 SPIKE ANALYSIS for ${brand}:`, {
      detected: spike.detected,
      currentCount: spike.currentCount,
      previousCount: spike.previousCount,
      spikeRatio: spike.spikeRatio,
      increase: spike.increase,
      minMentions: config.spikeDetection.minMentions,
      threshold: config.spikeDetection.threshold
    });

    if (spike.detected) {
      console.log(`🚨🚨🚨 SPIKE DETECTED for ${brand} 🚨🚨🚨`);
      console.log(`   Increase: ${spike.increase}%`);
      console.log(`   Current: ${spike.currentCount} mentions`);
      console.log(`   Previous: ${spike.previousCount} mentions`);
      console.log(`   Ratio: ${spike.spikeRatio}x`);
      console.log(`   Sentiment: ${spike.sentiment?.dominant}`);
      console.log(`   Sources:`, spike.sources);
      
      if (global.io) {
        console.log(`📡 Emitting spike alert via WebSocket for ${brand}`);
        
        // Emit to brand-specific room and general alerts
        global.io.to(brand).emit('spike-alert', spike);
        global.io.emit('spike-alert-general', spike);
        
        console.log(`✅ Spike alert emitted successfully`);
      } else {
        console.log(`❌ No WebSocket connection available to emit spike alert`);
      }
    } else {
      console.log(`✅ No spike detected for ${brand} (ratio: ${spike.spikeRatio}x, needs ${config.spikeDetection.threshold}x)`);
    }

  } catch (error) {
    console.error(`❌ Error collecting data for ${brand}:`, error.message);
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