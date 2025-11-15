// server/src/services/sentimentAnalyzer.js
import vader from 'vader-sentiment';
import config from '../config/config.js';

/**
 * Analyze sentiment of text using VADER
 * Returns: { sentiment: 'positive'|'neutral'|'negative', score: number }
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { 
      sentiment: 'neutral', 
      score: 0,
      compound: 0,
      positive: 0,
      neutral: 1,
      negative: 0
    };
  }

  try {
    // VADER returns: { neg, neu, pos, compound }
    const result = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    
    // Extract scores
    const compound = result.compound;
    const positive = result.pos;
    const neutral = result.neu;
    const negative = result.neg;
    
    // Classify based on compound score (VADER standard thresholds)
    let sentiment = 'neutral';
    if (compound >= 0.05) {
      sentiment = 'positive';
    } else if (compound <= -0.05) {
      sentiment = 'negative';
    }
    
    // Override with config thresholds if they exist
    if (config.sentiment?.thresholds) {
      if (compound >= config.sentiment.thresholds.positive) {
        sentiment = 'positive';
      } else if (compound <= config.sentiment.thresholds.negative) {
        sentiment = 'negative';
      }
    }

    return {
      sentiment,
      score: compound,       // Main compound score (-1 to 1)
      compound,              // VADER compound score
      positive,              // Positive proportion
      neutral,               // Neutral proportion
      negative,              // Negative proportion
      pos: positive,         // Alias for compatibility
      neu: neutral,          // Alias for compatibility
      neg: negative          // Alias for compatibility
    };

  } catch (error) {
    console.error('Sentiment analysis error:', error.message);
    return { 
      sentiment: 'neutral', 
      score: 0,
      compound: 0,
      positive: 0,
      neutral: 1,
      negative: 0,
      pos: 0,
      neu: 1,
      neg: 0
    };
  }
}

/**
 * Enhanced VADER sentiment with additional context awareness
 */
export function analyzeVADERSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { 
      sentiment: 'neutral', 
      compound: 0,
      pos: 0,
      neu: 1,
      neg: 0
    };
  }

  // Get base VADER result
  const baseResult = analyzeSentiment(text);
  
  // VADER already handles:
  // - Intensity boosters (very, extremely, etc.)
  // - Negation (not good -> negative)
  // - Punctuation (!!! increases intensity)
  // - ALL CAPS (AMAZING -> more intense)
  // - Emojis (😊, 😢, etc.)
  
  // We just return the VADER result with additional metadata
  const lowerText = text.toLowerCase();
  
  // Check for specific patterns
  const hasIntensifier = /\b(very|extremely|incredibly|absolutely|totally|completely)\b/.test(lowerText);
  const hasDiminisher = /\b(slightly|somewhat|barely|hardly|kind of|sort of)\b/.test(lowerText);
  const hasNegation = /\b(not|n't|no|never|neither|nobody|nothing|nor)\b/.test(lowerText);
  const hasExclamation = (text.match(/!/g) || []).length;
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  
  return {
    sentiment: baseResult.sentiment,
    compound: baseResult.compound,
    pos: baseResult.positive,
    neu: baseResult.neutral,
    neg: baseResult.negative,
    // Additional metadata
    hasIntensifier,
    hasDiminisher,
    hasNegation,
    exclamationCount: hasExclamation,
    capsRatio: capsRatio.toFixed(2),
    textLength: text.length
  };
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
    avgScore: 0,
    avgCompound: 0
  };

  let totalScore = 0;
  let totalCompound = 0;

  results.forEach(result => {
    stats[result.sentiment]++;
    totalScore += result.score;
    totalCompound += result.compound;
  });

  stats.avgScore = results.length > 0 ? totalScore / results.length : 0;
  stats.avgCompound = results.length > 0 ? totalCompound / results.length : 0;

  return {
    ...stats,
    distribution: {
      positive: ((stats.positive / stats.total) * 100).toFixed(1),
      neutral: ((stats.neutral / stats.total) * 100).toFixed(1),
      negative: ((stats.negative / stats.total) * 100).toFixed(1)
    },
    avgCompoundScore: stats.avgCompound.toFixed(3)
  };
}

/**
 * Analyze sentiment with context (considers brand name proximity)
 * This gives more weight to sentiment around brand mentions
 */
export function analyzeSentimentWithContext(text, brandName) {
  const baseResult = analyzeVADERSentiment(text);
  
  // Check if brand is mentioned
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  const brandMentioned = lowerText.includes(lowerBrand);

  if (!brandMentioned) {
    // Text doesn't mention brand directly, might be less relevant
    return {
      ...baseResult,
      relevance: 'low',
      contextCompound: 0
    };
  }

  // Find words around brand mention for context
  const words = text.split(/\s+/);
  const brandIndex = words.findIndex(w => 
    w.toLowerCase().includes(lowerBrand)
  );

  if (brandIndex !== -1) {
    // Get context window (5 words before and after for better context)
    const contextStart = Math.max(0, brandIndex - 5);
    const contextEnd = Math.min(words.length, brandIndex + 6);
    const contextWords = words.slice(contextStart, contextEnd).join(' ');
    
    const contextSentiment = analyzeVADERSentiment(contextWords);
    
    // Calculate weighted sentiment (context has more weight since it's more relevant)
    const weightedCompound = (contextSentiment.compound * 0.7) + (baseResult.compound * 0.3);
    
    let finalSentiment = 'neutral';
    if (weightedCompound >= 0.05) {
      finalSentiment = 'positive';
    } else if (weightedCompound <= -0.05) {
      finalSentiment = 'negative';
    }
    
    return {
      sentiment: finalSentiment,
      score: weightedCompound,
      compound: weightedCompound,
      sentimentScore: weightedCompound, // For backward compatibility
      contextSentiment: contextSentiment.sentiment,
      contextCompound: contextSentiment.compound,
      fullTextCompound: baseResult.compound,
      pos: contextSentiment.pos,
      neu: contextSentiment.neu,
      neg: contextSentiment.neg,
      relevance: 'high',
      brandPosition: brandIndex,
      contextWindow: contextWords
    };
  }

  return {
    ...baseResult,
    sentimentScore: baseResult.compound, // For backward compatibility
    relevance: 'medium'
  };
}

/**
 * Analyze emoji sentiment
 * VADER already handles emojis, but this provides additional emoji detection
 */
export function analyzeEmojiSentiment(text) {
  // Common emoji patterns
  const positiveEmojis = ['😊', '😄', '😃', '😀', '❤️', '💕', '👍', '🎉', '✨', '😍', '🥰', '🔥', '💯', '🙌', '👏', '💪'];
  const negativeEmojis = ['😢', '😞', '😔', '😟', '😠', '😡', '👎', '💔', '😤', '😫', '😩', '😭', '🤬', '😱'];
  
  let positiveEmojiCount = 0;
  let negativeEmojiCount = 0;
  
  positiveEmojis.forEach(emoji => {
    const count = (text.match(new RegExp(emoji, 'g')) || []).length;
    positiveEmojiCount += count;
  });
  
  negativeEmojis.forEach(emoji => {
    const count = (text.match(new RegExp(emoji, 'g')) || []).length;
    negativeEmojiCount += count;
  });
  
  const baseResult = analyzeSentiment(text);
  
  return {
    ...baseResult,
    emojiAnalysis: {
      hasEmojis: (positiveEmojiCount + negativeEmojiCount) > 0,
      positiveEmojis: positiveEmojiCount,
      negativeEmojis: negativeEmojiCount,
      emojiSentiment: positiveEmojiCount > negativeEmojiCount ? 'positive' : 
                      negativeEmojiCount > positiveEmojiCount ? 'negative' : 'neutral'
    }
  };
}

/**
 * Compare sentiment between two texts
 */
export function compareSentiments(text1, text2) {
  const result1 = analyzeVADERSentiment(text1);
  const result2 = analyzeVADERSentiment(text2);
  
  const difference = result1.compound - result2.compound;
  
  return {
    text1: {
      sentiment: result1.sentiment,
      compound: result1.compound
    },
    text2: {
      sentiment: result2.sentiment,
      compound: result2.compound
    },
    difference: difference.toFixed(3),
    morePositive: difference > 0 ? 'text1' : difference < 0 ? 'text2' : 'equal',
    significantDifference: Math.abs(difference) > 0.2
  };
}

/**
 * Get detailed sentiment breakdown
 */
export function getDetailedSentiment(text) {
  const result = analyzeVADERSentiment(text);
  const emojiAnalysis = analyzeEmojiSentiment(text);
  
  return {
    ...result,
    ...emojiAnalysis.emojiAnalysis,
    interpretation: {
      label: result.sentiment,
      intensity: Math.abs(result.compound) > 0.5 ? 'strong' : 
                 Math.abs(result.compound) > 0.2 ? 'moderate' : 'weak',
      confidence: Math.abs(result.compound).toFixed(2)
    }
  };
}

export default {
  analyzeSentiment,
  analyzeVADERSentiment,
  batchAnalyzeSentiment,
  getSentimentStats,
  analyzeSentimentWithContext,
  analyzeEmojiSentiment,
  compareSentiments,
  getDetailedSentiment
};