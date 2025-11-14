// server/src/services/sentimentAnalyzer.js
import Sentiment from 'sentiment';
import config from '../config/config.js';

const sentimentAnalyzer = new Sentiment();

/**
 * Analyze sentiment of text
 * Returns: { sentiment: 'positive'|'neutral'|'negative', score: number }
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', score: 0 };
  }

  const result = sentimentAnalyzer.analyze(text);
  
  // Normalize score to -1 to 1 range
  // The sentiment library returns raw scores, we'll normalize them
  const normalizedScore = normalizeScore(result.score, text.split(' ').length);
  
  // Classify based on thresholds
  let sentiment = 'neutral';
  if (normalizedScore >= config.sentiment.thresholds.positive) {
    sentiment = 'positive';
  } else if (normalizedScore <= config.sentiment.thresholds.negative) {
    sentiment = 'negative';
  }

  return {
    sentiment,
    score: normalizedScore,
    comparative: result.comparative,
    tokens: result.tokens,
    positive: result.positive,
    negative: result.negative
  };
}

/**
 * Normalize sentiment score to -1 to 1 range
 */
function normalizeScore(rawScore, wordCount) {
  if (wordCount === 0) return 0;
  
  // Use comparative score (score per word) and cap it
  const comparative = rawScore / wordCount;
  return Math.max(-1, Math.min(1, comparative));
}

/**
 * Batch analyze multiple texts
 */
export function batchAnalyzeSentiment(texts) {
  return texts.map(text => analyzeSentiment(text));
}

/**
 * Get sentiment statistics for a collection of texts
 */
export function getSentimentStats(texts) {
  const results = texts.map(text => analyzeSentiment(text));
  
  const stats = {
    total: results.length,
    positive: 0,
    neutral: 0,
    negative: 0,
    avgScore: 0
  };

  let totalScore = 0;

  results.forEach(result => {
    stats[result.sentiment]++;
    totalScore += result.score;
  });

  stats.avgScore = results.length > 0 ? totalScore / results.length : 0;

  return {
    ...stats,
    distribution: {
      positive: (stats.positive / stats.total * 100).toFixed(1),
      neutral: (stats.neutral / stats.total * 100).toFixed(1),
      negative: (stats.negative / stats.total * 100).toFixed(1)
    }
  };
}

/**
 * Analyze sentiment with context (considers brand name proximity)
 */
export function analyzeSentimentWithContext(text, brandName) {
  const baseResult = analyzeSentiment(text);
  
  // Check if brand is mentioned
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  const brandMentioned = lowerText.includes(lowerBrand);

  if (!brandMentioned) {
    // Text doesn't mention brand directly, might be less relevant
    return {
      ...baseResult,
      relevance: 'low'
    };
  }

  // Find words around brand mention for context
  const words = text.split(' ');
  const brandIndex = words.findIndex(w => 
    w.toLowerCase().includes(lowerBrand)
  );

  if (brandIndex !== -1) {
    // Get context window (3 words before and after)
    const contextStart = Math.max(0, brandIndex - 3);
    const contextEnd = Math.min(words.length, brandIndex + 4);
    const contextWords = words.slice(contextStart, contextEnd).join(' ');
    
    const contextSentiment = analyzeSentiment(contextWords);
    
    return {
      ...baseResult,
      contextSentiment: contextSentiment.sentiment,
      contextScore: contextSentiment.score,
      relevance: 'high'
    };
  }

  return {
    ...baseResult,
    relevance: 'medium'
  };
}