import config from '../config/config.js';
import { mentionStore } from '../models/Mention.js';
import { fetchRedditMentions } from '../sources/reddit.js';
import { fetchNewsMentions } from '../sources/newsAPI.js';
import { fetchTwitterMentions } from '../sources/twitter.js';
import { detectSpikes, monitorAllBrands } from './spikeDetector.js';

// Track which brands are being monitored - START EMPTY
const trackedBrands = new Set(["Nike","Google"]);
const collectionIntervals = new Map();

/**
 * Start data collection for all tracked brands
 */
export function startDataCollection() {
  console.log('🔄 Starting data collection service...');
  console.log('🔧 Data Collector Config Check:');
  console.log('   News enabled:', config.sources.news.enabled);
  console.log('   Reddit enabled:', config.sources.reddit.enabled);
  console.log('   Twitter enabled:', config.sources.twitter?.enabled || false);
  
  // Clear old data on restart to avoid timestamp issues
  mentionStore.clear();
  console.log('🧹 Cleared previous mention data');
  
  // Initialize with default brands if empty (optional)
  if (trackedBrands.size === 0) {
    console.log('📋 Starting with empty brand tracking - use API to add brands');
  }
  
  trackedBrands.forEach(brand => {
    startBrandCollection(brand);
  });

  console.log(`📊 Now tracking: ${Array.from(trackedBrands).join(', ') || 'No brands'}`);
  
  // Start spike monitoring
  startSpikeMonitoring();
}

/**
 * Start spike monitoring interval
 */
function startSpikeMonitoring() {
  // Check for spikes every 5 minutes
  setInterval(() => {
    if (trackedBrands.size > 0) {
      const activeSpikes = monitorAllBrands(Array.from(trackedBrands));
      
      if (activeSpikes.length > 0 && global.io) {
        console.log(`🚨 Monitoring: Found ${activeSpikes.length} active spikes`);
        global.io.emit('spike-monitor-update', {
          timestamp: new Date().toISOString(),
          activeSpikes,
          totalBrands: trackedBrands.size
        });
      }
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
  console.log(`\n🔍 [${new Date().toISOString()}] Starting data collection for ${brand}...`);

  try {
    const results = await Promise.allSettled([
      config.sources.reddit.enabled ? fetchRedditMentions(brand, 15) : Promise.resolve([]),
      config.sources.news.enabled ? fetchNewsMentions(brand, 10) : Promise.resolve([]),
      config.sources.twitter?.enabled ? fetchTwitterMentions(brand, 8) : Promise.resolve([])
    ]);

    // KEEP THIS - Important for source status
    console.log(`📦 Raw collection results for ${brand}:`, {
      reddit: results[0].status,
      news: results[1].status,
      twitter: results[2].status
    });

    let totalMentions = 0;
    let newMentions = [];

    results.forEach((result, index) => {
      const sourceNames = ['Reddit', 'News API', 'Twitter'];
      
      if (result.status === 'fulfilled') {
        const mentions = result.value;
        // KEEP THIS - Important for source counts
        console.log(`   📊 ${sourceNames[index]}: ${mentions.length} raw mentions`);
        totalMentions += mentions.length;

        // COMMENT OUT - Too verbose
        // if (mentions.length > 0) {
        //   console.log(`   📝 Sample ${sourceNames[index]} mention:`, {
        //     content: mentions[0].content?.substring(0, 100),
        //     source: mentions[0].source,
        //     timestamp: mentions[0].timestamp
        //   });
        // }

        // Add to store and track new ones
        mentions.forEach(mention => {
          const added = mentionStore.add(mention);
if (added) {
  newMentions.push(added);
  console.log(`NEW ${mention.source.toUpperCase()} mention: ${mention.content.substring(0, 60)}...`);
}
        });
      } else {
        // KEEP THIS - Important for error tracking
        console.error(`❌ ${sourceNames[index]} failed for ${brand}:`, result.reason);
      }
    });

    // KEEP THIS - Important final summary
    console.log(`📥 FINAL for ${brand}: ${totalMentions} total mentions (${newMentions.length} new)`);

    // Debug: Check what's actually in the store
    const storeCount = mentionStore.getAll({ brand }).length;
    console.log(`🏪 Store now has ${storeCount} mentions for ${brand}`);

    // KEEP THIS - Important source breakdown
    const allStoredMentions = mentionStore.getAll({ brand });
    const sourceBreakdown = {
      reddit: allStoredMentions.filter(m => m.source === 'reddit').length,
      news: allStoredMentions.filter(m => m.source === 'news').length,
      twitter: allStoredMentions.filter(m => m.source === 'twitter').length
    };
    console.log(`📊 Store breakdown for ${brand}:`, sourceBreakdown);

    // Emit new mentions via WebSocket
    if (newMentions.length > 0 && global.io) {
      // KEEP THIS - Important for WebSocket tracking
      console.log(`📡 Emitting ${newMentions.length} new mentions via WebSocket for ${brand}`);
      
      newMentions.forEach(mention => {
        global.io.to(brand).emit('new-mention', mention.toJSON());
      });
      
      // Also emit batch update
      global.io.emit('mentions-batch', {
        brand,
        count: newMentions.length,
        mentions: newMentions.map(m => m.toJSON())
      });
      
      console.log(`✅ WebSocket emissions completed for ${brand}`);
    } else {
      // COMMENT OUT - Too frequent
      // console.log(`📭 No new mentions to emit via WebSocket for ${brand}`);
    }

    // Enhanced spike detection with better logging
    if (newMentions.length > 0) {
      // COMMENT OUT - Too verbose
      // console.log(`🔍 Checking for spikes for ${brand}...`);
      
      const spike = detectSpikes(brand,'7d');
      
      // COMMENT OUT - Too detailed for normal operation
      // console.log(`📊 SPIKE ANALYSIS for ${brand}:`, {
      //   detected: spike.detected,
      //   currentCount: spike.currentCount,
      //   previousCount: spike.previousCount,
      //   spikeRatio: spike.spikeRatio,
      //   increase: spike.increase,
      //   minMentions: config.spikeDetection.minMentions,
      //   threshold: config.spikeDetection.threshold
      // });

      if (spike.detected) {
        // KEEP THIS - Critical for spike alerts
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
        // COMMENT OUT - Too frequent for no spikes
        // console.log(`✅ No spike detected for ${brand} (ratio: ${spike.spikeRatio}x, needs ${config.spikeDetection.threshold}x)`);
      }
    } else {
      // COMMENT OUT - Too frequent
      // console.log(`📭 No new mentions for ${brand}, skipping spike detection`);
    }

  } catch (error) {
    // KEEP THIS - Critical for error tracking
    console.error(`❌ Error collecting data for ${brand}:`, error.message);
    console.error(`🔍 Error stack:`, error.stack);
  }
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

  // KEEP THIS - Important for brand management
  console.log(`✨ Added new brand: ${brand}`);
  console.log(`📊 Now tracking: ${Array.from(trackedBrands).join(', ')}`);

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

  // KEEP THIS - Important for brand management
  console.log(`🗑️ Removed brand: ${brand}`);
  console.log(`📊 Now tracking: ${Array.from(trackedBrands).join(', ') || 'No brands'}`);

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

  // KEEP THIS - Important for manual triggers
  console.log(`🔧 MANUALLY triggering collection for ${brand}`);
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