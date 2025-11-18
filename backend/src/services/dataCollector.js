import config from "../config/config.js";
import { mentionStore } from "../models/MentionStore.js";
import { fetchRedditMentions } from "../sources/reddit.js";
import { fetchNewsMentions } from "../sources/newsAPI.js";
import { detectSpikes, monitorAllBrands } from "./spikeDetector.js";

// Track which brands are being monitored
const trackedBrands = new Set(["Nike", "Google"]);
const collectionIntervals = new Map();

/**
 * Start data collection for all tracked brands
 */
export function startDataCollection() {
  console.log("🔄 Starting data collection service...");

  // Clear old data on restart
  mentionStore.clear();

  if (trackedBrands.size === 0) {
    console.log("📋 Starting with empty brand tracking - use API to add brands");
  }

  trackedBrands.forEach((brand) => {
    startBrandCollection(brand);
  });

  console.log(`📊 Now tracking: ${Array.from(trackedBrands).join(", ") || "No brands"}`);

  // Start spike monitoring
  startSpikeMonitoring();
}

/**
 * Start spike monitoring interval
 */
function startSpikeMonitoring() {
  setInterval(() => {
    if (trackedBrands.size > 0) {
      const activeSpikes = monitorAllBrands(Array.from(trackedBrands));

      if (activeSpikes.length > 0 && global.io) {
        console.log(`🚨 Monitoring: Found ${activeSpikes.length} active spikes`);
        global.io.emit("spike-monitor-update", {
          timestamp: new Date().toISOString(),
          activeSpikes,
          totalBrands: trackedBrands.size,
        });
      }
    }
  }, config.intervals.spikeCheck || 300000);
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
  }, config.intervals.reddit);

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
  console.log(`🔍 [${new Date().toISOString()}] Collecting data for ${brand}...`);

  try {
    const results = await Promise.allSettled([
      config.sources.reddit.enabled
        ? fetchRedditMentions(brand, 15)
        : Promise.resolve([]),
      config.sources.news.enabled
        ? fetchNewsMentions(brand, 10)
        : Promise.resolve([]),
    ]);

    let totalCollected = 0;
    let newMentions = [];

    results.forEach((result, index) => {
      const sourceNames = ["Reddit", "News"];

      if (result.status === "fulfilled") {
        const mentions = result.value;
        totalCollected += mentions.length;

        mentions.forEach((mention) => {
          const added = mentionStore.add(mention);
          if (added) {
            newMentions.push(added);
          }
        });
      } else {
        console.error(`❌ ${sourceNames[index]} failed:`, result.reason.message);
      }
    });

    console.log(`✅ ${brand}: Collected ${totalCollected} mentions, ${newMentions.length} new (Store total: ${mentionStore.getAll({ brand }).length})`);

    // Emit new mentions via WebSocket
    if (newMentions.length > 0 && global.io) {
      newMentions.forEach((mention) => {
        global.io.to(brand).emit("new-mention", mention.toJSON());
      });

      global.io.emit("mentions-batch", {
        brand,
        count: newMentions.length,
        mentions: newMentions.map((m) => m.toJSON()),
      });
    }

    // Check for spikes
    if (newMentions.length > 0) {
      const spike = detectSpikes(brand, "7d");

      if (spike.detected && global.io) {
        console.log(`🚨 SPIKE DETECTED for ${brand}: ${spike.increase}% increase`);
        global.io.to(brand).emit("spike-alert", spike);
        global.io.emit("spike-alert-general", spike);
      }
    }
  } catch (error) {
    console.error(`❌ Error collecting data for ${brand}:`, error.message);
  }
}

/**
 * Add a new brand to track
 */
export function addBrand(brand) {
  if (trackedBrands.has(brand)) {
    return { success: false, message: "Brand already being tracked" };
  }

  trackedBrands.add(brand);
  startBrandCollection(brand);

  console.log(`✨ Added new brand: ${brand}`);

  return {
    success: true,
    message: `Started tracking ${brand}`,
    trackedBrands: Array.from(trackedBrands),
  };
}

/**
 * Remove a brand from tracking
 */
export function removeBrand(brand) {
  if (!trackedBrands.has(brand)) {
    return { success: false, message: "Brand not being tracked" };
  }

  stopBrandCollection(brand);

  console.log(`🗑️ Removed brand: ${brand}`);

  return {
    success: true,
    message: `Stopped tracking ${brand}`,
    trackedBrands: Array.from(trackedBrands),
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
    throw new Error("Brand not being tracked");
  }

  console.log(`🔧 Manually triggering collection for ${brand}`);
  await collectBrandData(brand);
  return { success: true, message: "Collection triggered" };
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
  console.log("🛑 All data collection stopped");
}

// Cleanup on process exit
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down data collection...");
  stopAllCollection();
  process.exit(0);
});