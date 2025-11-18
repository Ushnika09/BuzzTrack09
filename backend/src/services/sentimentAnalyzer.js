// server/src/services/sentimentAnalyzer.js
import vader from 'vader-sentiment';
import config from '../config/config.js';

/**
 * Main sentiment analysis function with optional enhancements
 * @param {string} text - Text to analyze
 * @param {object} options - { detailed: bool, emoji: bool }
 * @returns {object} Sentiment analysis result
 */
export function analyzeSentiment(text, options = {}) {
  if (!text || typeof text !== 'string') {
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

  try {
    // VADER analysis
    const result = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    const compound = result.compound;
    
    // Classify based on compound score
    let sentiment = 'neutral';
    if (compound >= (config.sentiment?.thresholds?.positive || 0.05)) {
      sentiment = 'positive';
    } else if (compound <= (config.sentiment?.thresholds?.negative || -0.05)) {
      sentiment = 'negative';
    }

    const output = {
      sentiment,
      score: compound,
      compound,
      positive: result.pos,
      neutral: result.neu,
      negative: result.neg,
      pos: result.pos,
      neu: result.neu,
      neg: result.neg
    };

    // Add detailed metadata if requested
    if (options.detailed) {
      const lowerText = text.toLowerCase();
      output.hasIntensifier = /\b(very|extremely|incredibly|absolutely|totally|completely)\b/.test(lowerText);
      output.hasDiminisher = /\b(slightly|somewhat|barely|hardly|kind of|sort of)\b/.test(lowerText);
      output.hasNegation = /\b(not|n't|no|never|neither|nobody|nothing|nor)\b/.test(lowerText);
      output.exclamationCount = (text.match(/!/g) || []).length;
      output.capsRatio = ((text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1)).toFixed(2);
      output.textLength = text.length;
      output.interpretation = {
        label: sentiment,
        intensity: Math.abs(compound) > 0.5 ? 'strong' : 
                   Math.abs(compound) > 0.2 ? 'moderate' : 'weak',
        confidence: Math.abs(compound).toFixed(2)
      };
    }

    // Add emoji analysis if requested
    if (options.emoji) {
      output.emojiAnalysis = _analyzeEmojis(text);
    }

    return output;

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
 * Internal emoji analysis helper
 */
function _analyzeEmojis(text) {
  const positiveEmojis = ['😊', '😄', '😃', '😀', '❤️', '💕', '👍', '🎉', '✨', '😍', '🥰', '🔥', '💯', '🙌', '👏', '💪'];
  const negativeEmojis = ['😢', '😞', '😔', '😟', '😠', '😡', '👎', '💔', '😤', '😫', '😩', '😭', '🤬', '😱'];
  
  let positiveEmojiCount = 0;
  let negativeEmojiCount = 0;
  
  positiveEmojis.forEach(emoji => {
    positiveEmojiCount += (text.match(new RegExp(emoji, 'g')) || []).length;
  });
  
  negativeEmojis.forEach(emoji => {
    negativeEmojiCount += (text.match(new RegExp(emoji, 'g')) || []).length;
  });
  
  return {
    hasEmojis: (positiveEmojiCount + negativeEmojiCount) > 0,
    positiveEmojis: positiveEmojiCount,
    negativeEmojis: negativeEmojiCount,
    emojiSentiment: positiveEmojiCount > negativeEmojiCount ? 'positive' : 
                    negativeEmojiCount > positiveEmojiCount ? 'negative' : 'neutral'
  };
}

/**
 * Analyze sentiment with brand context (considers proximity to brand mention)
 */
export function analyzeSentimentWithContext(text, brandName) {
  const baseResult = analyzeSentiment(text, { detailed: true });
  
  // Check if brand is mentioned
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  const brandMentioned = lowerText.includes(lowerBrand);

  if (!brandMentioned) {
    return {
      ...baseResult,
      relevance: 'low',
      contextCompound: 0,
      sentimentScore: baseResult.compound
    };
  }

  // Find words around brand mention for context
  const words = text.split(/\s+/);
  const brandIndex = words.findIndex(w => 
    w.toLowerCase().includes(lowerBrand)
  );

  if (brandIndex !== -1) {
    // Get context window (5 words before and after)
    const contextStart = Math.max(0, brandIndex - 5);
    const contextEnd = Math.min(words.length, brandIndex + 6);
    const contextWords = words.slice(contextStart, contextEnd).join(' ');
    
    const contextSentiment = analyzeSentiment(contextWords);
    
    // Weighted sentiment (context has more weight)
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
      sentimentScore: weightedCompound,
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
    sentimentScore: baseResult.compound,
    relevance: 'medium'
  };
}

/**
 * Get sentiment statistics for multiple texts
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

// Backward compatibility aliases
export const analyzeVADERSentiment = analyzeSentiment;
export const getDetailedSentiment = (text) => analyzeSentiment(text, { detailed: true, emoji: true });
export const analyzeEmojiSentiment = (text) => analyzeSentiment(text, { emoji: true });
export const batchAnalyzeSentiment = (texts) => texts.map(text => analyzeSentiment(text));

export default {
  analyzeSentiment,
  analyzeSentimentWithContext,
  getSentimentStats,
  analyzeVADERSentiment,
  getDetailedSentiment,
  analyzeEmojiSentiment,
  batchAnalyzeSentiment
};