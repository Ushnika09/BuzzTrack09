// server/src/services/topicAnalyzer.js

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
  'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who', 'which',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'am', 'been', 'being', 'do', 'does', 'did', 'doing', 'would', 'could', 'ought',
  'get', 'got', 'getting', 'like', 'really', 'one', 'two', 'new', 'about', 'after'
]);

// Common brand-related keywords to exclude (since we're already tracking brands)
const BRAND_WORDS = new Set(['nike', 'apple', 'tesla', 'brand', 'company', 'product']);

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  if (!text) return [];

  // Clean and tokenize
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && // At least 4 characters
      !STOP_WORDS.has(word) &&
      !BRAND_WORDS.has(word) &&
      !/^\d+$/.test(word) // Not just numbers
    );

  return words;
}

/**
 * Calculate TF-IDF scores for keywords
 */
function calculateTFIDF(documents) {
  const termFrequency = new Map();
  const documentFrequency = new Map();
  const totalDocs = documents.length;

  // Calculate term frequency in each document
  documents.forEach(doc => {
    const words = extractKeywords(doc);
    const uniqueWords = new Set(words);
    
    words.forEach(word => {
      if (!termFrequency.has(word)) {
        termFrequency.set(word, 0);
      }
      termFrequency.set(word, termFrequency.get(word) + 1);
    });

    // Document frequency (how many docs contain this word)
    uniqueWords.forEach(word => {
      if (!documentFrequency.has(word)) {
        documentFrequency.set(word, 0);
      }
      documentFrequency.set(word, documentFrequency.get(word) + 1);
    });
  });

  // Calculate TF-IDF scores
  const tfidf = new Map();
  termFrequency.forEach((tf, term) => {
    const df = documentFrequency.get(term);
    const idf = Math.log(totalDocs / (df + 1)); // Add 1 to avoid division by zero
    tfidf.set(term, tf * idf);
  });

  return tfidf;
}

/**
 * Extract top topics from mentions
 */
export function extractTopics(mentions, limit = 20) {
  if (!mentions || mentions.length === 0) {
    return [];
  }

  // Get all text content
  const documents = mentions.map(m => m.content);
  
  // Calculate TF-IDF
  const tfidf = calculateTFIDF(documents);

  // Get top keywords by score
  const topics = Array.from(tfidf.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword, score]) => {
      // Get mentions containing this keyword
      const relatedMentions = mentions.filter(m => 
        m.content.toLowerCase().includes(keyword)
      );

      // Calculate sentiment for this topic
      const sentimentCounts = {
        positive: 0,
        neutral: 0,
        negative: 0
      };

      relatedMentions.forEach(m => {
        sentimentCounts[m.sentiment]++;
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
        percentage: ((relatedMentions.length / mentions.length) * 100).toFixed(1)
      };
    });

  return topics;
}

/**
 * Group mentions by topic/theme
 */
export function clusterByTopic(mentions, topTopics = 10) {
  const topics = extractTopics(mentions, topTopics);
  
  const clusters = topics.map(topic => {
    const relatedMentions = mentions.filter(m =>
      m.content.toLowerCase().includes(topic.keyword)
    );

    return {
      topic: topic.keyword,
      count: relatedMentions.length,
      sentiment: topic.sentiment,
      mentions: relatedMentions.slice(0, 5).map(m => ({
        id: m.id,
        content: m.content.substring(0, 100),
        source: m.source,
        sentiment: m.sentiment,
        timestamp: m.timestamp
      }))
    };
  });

  return clusters;
}

/**
 * Get trending topics (topics appearing more recently)
 */
export function getTrendingTopics(mentions, limit = 10) {
  if (!mentions || mentions.length === 0) {
    return [];
  }

  const now = Date.now();
  const recentWindow = 3600000; // 1 hour

  // Split mentions into recent and older
  const recentMentions = mentions.filter(m =>
    now - new Date(m.timestamp).getTime() < recentWindow
  );
  const olderMentions = mentions.filter(m =>
    now - new Date(m.timestamp).getTime() >= recentWindow
  );

  if (recentMentions.length === 0) {
    return extractTopics(mentions, limit);
  }

  // Get topics from both periods
  const recentTopics = extractTopics(recentMentions, 30);
  const olderTopics = extractTopics(olderMentions, 30);

  // Create map of older topic counts
  const olderCounts = new Map();
  olderTopics.forEach(t => olderCounts.set(t.keyword, t.count));

  // Calculate trend score (recent count vs older count)
  const trendingTopics = recentTopics.map(topic => {
    const oldCount = olderCounts.get(topic.keyword) || 0;
    const recentCount = topic.count;
    
    // Calculate trend ratio
    const trendRatio = oldCount > 0 
      ? recentCount / oldCount 
      : recentCount > 0 ? 10 : 0; // If new, give high ratio

    return {
      ...topic,
      trendRatio: parseFloat(trendRatio.toFixed(2)),
      oldCount,
      recentCount,
      isTrending: trendRatio > 1.5 // 50% increase
    };
  })
  .sort((a, b) => b.trendRatio - a.trendRatio)
  .slice(0, limit);

  return trendingTopics;
}

/**
 * Get topic timeline (how topics evolve over time)
 */
export function getTopicTimeline(mentions, topicKeyword, hours = 24) {
  const filteredMentions = mentions.filter(m =>
    m.content.toLowerCase().includes(topicKeyword.toLowerCase())
  );

  const now = Date.now();
  const hourMs = 3600000;
  
  // Group by hour
  const timeline = [];
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

    timeline.push({
      hour: new Date(hourStart).toISOString(),
      count: hourMentions.length,
      sentiment: sentimentCounts
    });
  }

  return timeline;
}

/**
 * Compare topics across brands
 */
export function compareTopicsAcrossBrands(mentionsByBrand) {
  const brandTopics = {};

  Object.entries(mentionsByBrand).forEach(([brand, mentions]) => {
    brandTopics[brand] = extractTopics(mentions, 10);
  });

  // Find common topics
  const allKeywords = new Set();
  Object.values(brandTopics).forEach(topics => {
    topics.forEach(t => allKeywords.add(t.keyword));
  });

  const comparison = Array.from(allKeywords).map(keyword => {
    const brandData = {};
    Object.entries(brandTopics).forEach(([brand, topics]) => {
      const topic = topics.find(t => t.keyword === keyword);
      brandData[brand] = topic ? topic.count : 0;
    });

    return {
      keyword,
      ...brandData,
      total: Object.values(brandData).reduce((sum, count) => sum + count, 0)
    };
  })
  .sort((a, b) => b.total - a.total)
  .slice(0, 15);

  return comparison;
}