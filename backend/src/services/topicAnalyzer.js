// server/src/services/topicAnalyzer.js

// Enhanced stop words including common social media terms
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
  'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who', 'which',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'am', 'been', 'being', 'do', 'does', 'did', 'doing', 'would', 'could', 'ought',
  'get', 'got', 'getting', 'like', 'really', 'one', 'two', 'new', 'about', 'after',
  // Social media specific
  'http', 'https', 'www', 'com', 'via', 'amp', 'says', 'said', 'make', 'made',
  'want', 'need', 'know', 'think', 'going', 'see', 'look', 'right', 'left', 'back'
]);

// Brand-related and generic terms to exclude
const BRAND_WORDS = new Set([
  'nike', 'apple', 'tesla', 'google', 'amazon', 'microsoft',
  'brand', 'company', 'product', 'business', 'market', 'industry'
]);

// Topic categories for intelligent clustering
const TOPIC_CATEGORIES = {
  quality: ['quality', 'best', 'perfect', 'excellent', 'amazing', 'great', 'good', 'bad', 'poor', 'terrible', 'awful'],
  price: ['price', 'cost', 'expensive', 'cheap', 'affordable', 'worth', 'value', 'deal', 'discount', 'sale'],
  service: ['service', 'support', 'help', 'customer', 'delivery', 'shipping', 'return', 'refund'],
  product: ['design', 'style', 'look', 'color', 'size', 'feature', 'performance', 'speed', 'battery'],
  experience: ['experience', 'user', 'interface', 'easy', 'difficult', 'simple', 'complex', 'comfortable'],
  innovation: ['innovation', 'technology', 'smart', 'advanced', 'modern', 'future', 'revolutionary'],
  comparison: ['better', 'worse', 'compare', 'versus', 'alternative', 'competitor', 'similar'],
  issues: ['problem', 'issue', 'bug', 'error', 'broken', 'fail', 'wrong', 'damage']
};

/**
 * Enhanced keyword extraction with lemmatization-like features
 */
function extractKeywords(text) {
  if (!text) return [];

  // Clean and tokenize
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => 
      word.length > 3 && 
      !STOP_WORDS.has(word) &&
      !BRAND_WORDS.has(word) &&
      !/^\d+$/.test(word) &&
      !/^[^\w]+$/.test(word)
    );

  // Basic stemming (remove common suffixes)
  return words.map(word => {
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('ly')) return word.slice(0, -2);
    if (word.endsWith('ness')) return word.slice(0, -4);
    return word;
  });
}

/**
 * Enhanced TF-IDF calculation with better scoring
 */
function calculateTFIDF(documents) {
  const termFrequency = new Map();
  const documentFrequency = new Map();
  const totalDocs = documents.length;

  if (totalDocs === 0) return new Map();

  // Calculate frequencies
  documents.forEach(doc => {
    const words = extractKeywords(doc);
    const uniqueWords = new Set(words);
    
    words.forEach(word => {
      termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
    });

    uniqueWords.forEach(word => {
      documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
    });
  });

  // Calculate TF-IDF with improved formula
  const tfidf = new Map();
  termFrequency.forEach((tf, term) => {
    const df = documentFrequency.get(term) || 1;
    // Enhanced IDF formula: log((N + 1) / (df + 1)) + 1
    const idf = Math.log((totalDocs + 1) / (df + 1)) + 1;
    // Boost score for terms that appear in multiple documents
    const boost = df > 1 ? 1.2 : 1.0;
    tfidf.set(term, (tf * idf * boost));
  });

  return tfidf;
}

/**
 * Categorize keyword into theme
 */
function categorizeKeyword(keyword) {
  for (const [category, keywords] of Object.entries(TOPIC_CATEGORIES)) {
    if (keywords.some(k => keyword.includes(k) || k.includes(keyword))) {
      return category;
    }
  }
  return 'general';
}

/**
 * Extract top topics with enhanced metadata
 */
export function extractTopics(mentions, limit = 20) {
  if (!mentions || mentions.length === 0) {
    return [];
  }

  const documents = mentions.map(m => m.content);
  const tfidf = calculateTFIDF(documents);

  const topics = Array.from(tfidf.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit * 2) // Get more initially for better filtering
    .map(([keyword, score]) => {
      const relatedMentions = mentions.filter(m => 
        m.content.toLowerCase().includes(keyword)
      );

      const sentimentCounts = {
        positive: 0,
        neutral: 0,
        negative: 0
      };

      let totalEngagement = 0;
      relatedMentions.forEach(m => {
        sentimentCounts[m.sentiment]++;
        totalEngagement += (m.engagement?.likes || 0) + 
                          (m.engagement?.comments || 0) + 
                          (m.engagement?.shares || 0);
      });

      const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) =>
        sentimentCounts[a] > sentimentCounts[b] ? a : b
      );

      return {
        keyword,
        score: parseFloat(score.toFixed(2)),
        count: relatedMentions.length,
        sentiment: dominantSentiment,
        sentimentBreakdown: sentimentCounts,
        percentage: parseFloat(((relatedMentions.length / mentions.length) * 100).toFixed(1)),
        category: categorizeKeyword(keyword),
        avgEngagement: relatedMentions.length > 0 
          ? Math.round(totalEngagement / relatedMentions.length) 
          : 0,
        importance: calculateImportance(score, relatedMentions.length, sentimentCounts)
      };
    })
    .filter(topic => topic.count >= 2) // Minimum 2 mentions
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit);

  return topics;
}

/**
 * Calculate topic importance (combines multiple factors)
 */
function calculateImportance(tfidfScore, count, sentimentCounts) {
  const sentimentWeight = Math.abs(sentimentCounts.positive - sentimentCounts.negative);
  return (tfidfScore * 0.4) + (count * 0.4) + (sentimentWeight * 0.2);
}

/**
 * Enhanced topic clustering with theme detection
 */
export function clusterByTopic(mentions, topTopics = 10) {
  const topics = extractTopics(mentions, topTopics);
  
  const clusters = topics.map(topic => {
    const relatedMentions = mentions.filter(m =>
      m.content.toLowerCase().includes(topic.keyword)
    );

    // Calculate additional cluster metrics
    const sources = {};
    const platforms = {};
    relatedMentions.forEach(m => {
      sources[m.source] = (sources[m.source] || 0) + 1;
      platforms[m.platform] = (platforms[m.platform] || 0) + 1;
    });

    return {
      topic: topic.keyword,
      category: topic.category,
      count: relatedMentions.length,
      sentiment: topic.sentiment,
      sentimentBreakdown: topic.sentimentBreakdown,
      sources,
      topPlatforms: Object.entries(platforms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([platform, count]) => ({ platform, count })),
      mentions: relatedMentions
        .sort((a, b) => {
          const aEng = (a.engagement?.likes || 0) + (a.engagement?.comments || 0);
          const bEng = (b.engagement?.likes || 0) + (b.engagement?.comments || 0);
          return bEng - aEng;
        })
        .slice(0, 5)
        .map(m => ({
          id: m.id,
          content: m.content.substring(0, 150),
          source: m.source,
          platform: m.platform,
          sentiment: m.sentiment,
          timestamp: m.timestamp,
          url: m.url,
          engagement: m.engagement
        }))
    };
  });

  return clusters;
}

/**
 * Enhanced trending topics with velocity calculation
 */
export function getTrendingTopics(mentions, limit = 10) {
  if (!mentions || mentions.length === 0) {
    return [];
  }

  const now = Date.now();
  const recentWindow = 3600000; // 1 hour
  const mediumWindow = 6 * 3600000; // 6 hours

  const recentMentions = mentions.filter(m =>
    now - new Date(m.timestamp).getTime() < recentWindow
  );
  
  const mediumMentions = mentions.filter(m => {
    const age = now - new Date(m.timestamp).getTime();
    return age >= recentWindow && age < mediumWindow;
  });

  const olderMentions = mentions.filter(m =>
    now - new Date(m.timestamp).getTime() >= mediumWindow
  );

  if (recentMentions.length === 0) {
    return extractTopics(mentions, limit);
  }

  const recentTopics = extractTopics(recentMentions, 30);
  const mediumTopics = extractTopics(mediumMentions.length > 0 ? mediumMentions : olderMentions, 30);

  const mediumCounts = new Map();
  mediumTopics.forEach(t => mediumCounts.set(t.keyword, t.count));

  const trendingTopics = recentTopics.map(topic => {
    const oldCount = mediumCounts.get(topic.keyword) || 0;
    const recentCount = topic.count;
    
    // Calculate velocity (rate of change)
    const trendRatio = oldCount > 0 
      ? recentCount / oldCount 
      : recentCount > 0 ? 10 : 0;

    // Calculate momentum (recent count × ratio)
    const momentum = recentCount * Math.min(trendRatio, 20);

    return {
      ...topic,
      trendRatio: parseFloat(trendRatio.toFixed(2)),
      oldCount,
      recentCount,
      momentum: parseFloat(momentum.toFixed(2)),
      isTrending: trendRatio > 1.5,
      velocity: trendRatio > 5 ? 'rapid' : trendRatio > 2 ? 'fast' : 'moderate'
    };
  })
  .sort((a, b) => b.momentum - a.momentum)
  .slice(0, limit);

  return trendingTopics;
}

/**
 * Enhanced topic timeline with trend analysis
 */
export function getTopicTimeline(mentions, topicKeyword, hours = 24) {
  const filteredMentions = mentions.filter(m =>
    m.content.toLowerCase().includes(topicKeyword.toLowerCase())
  );

  if (filteredMentions.length === 0) {
    return { timeline: [], trend: 'stable', peakHour: null };
  }

  const now = Date.now();
  const hourMs = 3600000;
  const timeline = [];
  let maxCount = 0;
  let peakHour = null;

  for (let i = hours - 1; i >= 0; i--) {
    const hourStart = now - (i * hourMs);
    const hourEnd = hourStart + hourMs;
    
    const hourMentions = filteredMentions.filter(m => {
      const time = new Date(m.timestamp).getTime();
      return time >= hourStart && time < hourEnd;
    });

    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    hourMentions.forEach(m => {
      sentimentCounts[m.sentiment]++;
    });

    const count = hourMentions.length;
    if (count > maxCount) {
      maxCount = count;
      peakHour = new Date(hourStart).toISOString();
    }

    timeline.push({
      hour: new Date(hourStart).toISOString(),
      count,
      sentiment: sentimentCounts,
      dominantSentiment: Object.keys(sentimentCounts).reduce((a, b) =>
        sentimentCounts[a] > sentimentCounts[b] ? a : b
      )
    });
  }

  // Calculate trend (growing, declining, stable)
  const firstHalf = timeline.slice(0, Math.floor(hours / 2));
  const secondHalf = timeline.slice(Math.floor(hours / 2));
  
  const firstAvg = firstHalf.reduce((sum, t) => sum + t.count, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, t) => sum + t.count, 0) / secondHalf.length;
  
  let trend = 'stable';
  if (secondAvg > firstAvg * 1.3) trend = 'growing';
  else if (secondAvg < firstAvg * 0.7) trend = 'declining';

  return {
    timeline,
    trend,
    peakHour,
    totalMentions: filteredMentions.length,
    avgPerHour: (filteredMentions.length / hours).toFixed(1)
  };
}

/**
 * Enhanced cross-brand topic comparison
 */
export function compareTopicsAcrossBrands(mentionsByBrand) {
  const brandTopics = {};

  Object.entries(mentionsByBrand).forEach(([brand, mentions]) => {
    brandTopics[brand] = extractTopics(mentions, 15);
  });

  const allKeywords = new Set();
  Object.values(brandTopics).forEach(topics => {
    topics.forEach(t => allKeywords.add(t.keyword));
  });

  const comparison = Array.from(allKeywords).map(keyword => {
    const brandData = {};
    const sentimentData = {};
    const categoryData = {};

    Object.entries(brandTopics).forEach(([brand, topics]) => {
      const topic = topics.find(t => t.keyword === keyword);
      brandData[brand] = topic ? topic.count : 0;
      sentimentData[brand] = topic ? topic.sentiment : 'neutral';
      categoryData[brand] = topic ? topic.category : 'general';
    });

    const total = Object.values(brandData).reduce((sum, count) => sum + count, 0);
    const brandsUsing = Object.values(brandData).filter(count => count > 0).length;

    return {
      keyword,
      ...brandData,
      total,
      brandsUsing,
      sentimentByBrand: sentimentData,
      category: Object.values(categoryData)[0] || 'general',
      commonality: parseFloat((brandsUsing / Object.keys(mentionsByBrand).length * 100).toFixed(1))
    };
  })
  .sort((a, b) => b.total - a.total)
  .slice(0, 20);

  return comparison;
}

/**
 * NEW: Get topic themes (grouped categories)
 */
export function getTopicThemes(mentions) {
  const topics = extractTopics(mentions, 50);
  const themes = {};

  topics.forEach(topic => {
    if (!themes[topic.category]) {
      themes[topic.category] = {
        category: topic.category,
        topics: [],
        totalMentions: 0,
        sentiment: { positive: 0, neutral: 0, negative: 0 }
      };
    }

    themes[topic.category].topics.push(topic);
    themes[topic.category].totalMentions += topic.count;
    themes[topic.category].sentiment.positive += topic.sentimentBreakdown.positive;
    themes[topic.category].sentiment.neutral += topic.sentimentBreakdown.neutral;
    themes[topic.category].sentiment.negative += topic.sentimentBreakdown.negative;
  });

  return Object.values(themes)
    .sort((a, b) => b.totalMentions - a.totalMentions)
    .map(theme => ({
      ...theme,
      dominantSentiment: Object.keys(theme.sentiment).reduce((a, b) =>
        theme.sentiment[a] > theme.sentiment[b] ? a : b
      )
    }));
}

/**
 * NEW: Detect emerging topics (new topics gaining traction)
 */
export function detectEmergingTopics(mentions, limit = 5) {
  const now = Date.now();
  const veryRecentWindow = 1800000; // 30 minutes
  const recentWindow = 3600000; // 1 hour

  const veryRecentMentions = mentions.filter(m =>
    now - new Date(m.timestamp).getTime() < veryRecentWindow
  );

  const recentMentions = mentions.filter(m => {
    const age = now - new Date(m.timestamp).getTime();
    return age >= veryRecentWindow && age < recentWindow;
  });

  if (veryRecentMentions.length === 0) return [];

  const veryRecentTopics = extractTopics(veryRecentMentions, 20);
  const recentTopics = extractTopics(recentMentions, 20);

  const recentKeywords = new Set(recentTopics.map(t => t.keyword));

  // Find topics that are new (not in recent) or rapidly growing
  const emerging = veryRecentTopics
    .filter(topic => !recentKeywords.has(topic.keyword) || topic.count > 3)
    .map(topic => ({
      ...topic,
      isNew: !recentKeywords.has(topic.keyword),
      growthRate: !recentKeywords.has(topic.keyword) 
        ? 'new' 
        : 'accelerating'
    }))
    .slice(0, limit);

  return emerging;
}