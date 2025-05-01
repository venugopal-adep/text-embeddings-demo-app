const natural = require('natural');
const { create, all } = require('mathjs');
const math = create(all);

/**
 * One-Hot Encoding Implementation
 */
function oneHotEncoding(text) {
  const tokens = tokenize(text);
  const uniqueTokens = [...new Set(tokens)];
  const wordToIdx = {};
  
  // Create word to index mapping
  uniqueTokens.forEach((token, idx) => {
    wordToIdx[token] = idx;
  });
  
  // Generate one-hot vectors for each token
  const encodings = tokens.map(token => {
    const encoding = Array(uniqueTokens.length).fill(0);
    encoding[wordToIdx[token]] = 1;
    return encoding;
  });
  
  return {
    tokens,
    uniqueTokens,
    encodings,
    vocabularySize: uniqueTokens.length,
    dimensions: uniqueTokens.length * tokens.length,
    wordToIdx
  };
}

/**
 * Bag of Words Implementation
 */
function bagOfWords(documents) {
  // Tokenize all documents
  const tokenizedDocs = documents.map(tokenize);
  
  // Create a vocabulary of unique words across all documents
  const vocabulary = new Set();
  tokenizedDocs.forEach(tokens => {
    tokens.forEach(token => vocabulary.add(token));
  });
  
  const uniqueTokens = [...vocabulary].sort();
  const wordToIdx = {};
  
  // Create word to index mapping
  uniqueTokens.forEach((token, idx) => {
    wordToIdx[token] = idx;
  });
  
  // Generate count vectors for each document
  const countVectors = tokenizedDocs.map(tokens => {
    const vector = Array(uniqueTokens.length).fill(0);
    tokens.forEach(token => {
      vector[wordToIdx[token]]++;
    });
    return vector;
  });
  
  // Calculate document similarity matrix
  const similarityMatrix = calculateCosineSimilarityMatrix(countVectors);
  
  return {
    documents,
    tokenizedDocs,
    uniqueTokens,
    countVectors,
    similarityMatrix,
    vocabularySize: uniqueTokens.length,
    nonZeroValues: countNonZeroValues(countVectors),
    sparsity: calculateSparsity(countVectors, documents.length, uniqueTokens.length)
  };
}

/**
 * TF-IDF Implementation
 */
function tfidf(documents) {
  // Use the natural library's TfIdf implementation
  const tfidfInstance = new natural.TfIdf();
  
  // Add all documents
  documents.forEach(doc => {
    tfidfInstance.addDocument(doc);
  });
  
  // Get all unique terms in the corpus
  const uniqueTerms = new Set();
  for (let i = 0; i < documents.length; i++) {
    tfidfInstance.listTerms(i).forEach(term => {
      uniqueTerms.add(term.term);
    });
  }
  
  const terms = [...uniqueTerms].sort();
  
  // Create the TF-IDF matrix
  const tfidfMatrix = [];
  for (let i = 0; i < documents.length; i++) {
    const docVector = Array(terms.length).fill(0);
    
    tfidfInstance.listTerms(i).forEach(term => {
      const termIndex = terms.indexOf(term.term);
      if (termIndex !== -1) {
        docVector[termIndex] = Math.round(term.tfidf * 100) / 100; // Round to 2 decimal places
      }
    });
    
    tfidfMatrix.push(docVector);
  }
  
  // Calculate document similarity matrix
  const similarityMatrix = calculateCosineSimilarityMatrix(tfidfMatrix);
  
  return {
    documents,
    terms,
    tfidfMatrix,
    similarityMatrix
  };
}

/**
 * Word Embeddings (with semantic relationships for demonstration)
 */
function wordEmbeddings(sentences) {
  // Tokenize all sentences
  const tokenizedSentences = sentences.map(tokenize);
  const allTokens = [];
  tokenizedSentences.forEach(tokens => {
    allTokens.push(...tokens);
  });
  
  const uniqueTokens = [...new Set(allTokens)].sort();
  const embeddingDimension = 2; // Using 2D for visualization
  
  // Create simplified embeddings with semantic relationships
  // In a real application, you'd use pre-trained word vectors from models like Word2Vec, GloVe, or FastText
  const wordVectors = {};
  
  // Define semantic clusters to position similar words close to each other
  const semanticClusters = {
    animals: {
      words: ['cat', 'dog', 'animal', 'pet'],
      center: [0.2, 0.8],
      variance: 0.05
    },
    surfaces: {
      words: ['floor', 'mat', 'carpet', 'ground'],
      center: [0.8, 0.2],
      variance: 0.05
    },
    actions: {
      words: ['play', 'run', 'jump', 'chase', 'sits', 'sitting'],
      center: [0.6, 0.6],
      variance: 0.08
    },
    objects: {
      words: ['toy', 'ball', 'house', 'food', 'water'],
      center: [0.4, 0.4],
      variance: 0.07
    }
  };
  
  // Helper function to get random variance
  function getRandomVariation(variance) {
    return (Math.random() - 0.5) * 2 * variance;
  }
  
  // Assign vectors based on semantic clusters when possible
  uniqueTokens.forEach(token => {
    let assigned = false;
    
    // Check if the token belongs to a semantic cluster
    for (const cluster in semanticClusters) {
      if (semanticClusters[cluster].words.includes(token)) {
        const center = semanticClusters[cluster].center;
        const variance = semanticClusters[cluster].variance;
        
        // Assign a vector near the cluster center
        wordVectors[token] = [
          Math.max(0, Math.min(1, center[0] + getRandomVariation(variance))),
          Math.max(0, Math.min(1, center[1] + getRandomVariation(variance)))
        ];
        assigned = true;
        break;
      }
    }
    
    // If not in any cluster, assign a random vector (as before)
    if (!assigned) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = ((hash << 5) - hash) + token.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Normalize hash to create vectors between 0 and 1
      wordVectors[token] = [
        (Math.abs(Math.sin(hash)) * 0.5) + 0.25,
        (Math.abs(Math.cos(hash)) * 0.5) + 0.25
      ];
    }
  });
  
  // Create sentence embeddings (averaging word vectors)
  const sentenceVectors = sentences.map(sentence => {
    const tokens = tokenize(sentence);
    if (tokens.length === 0) return [0, 0];
    
    // Get vectors for tokens that exist in our vocabulary
    const vectors = tokens
      .filter(token => wordVectors[token])
      .map(token => wordVectors[token]);
    
    if (vectors.length === 0) return [0, 0];
    
    // Average the vectors
    return vectors.reduce((acc, vec) => {
      return [acc[0] + vec[0], acc[1] + vec[1]];
    }, [0, 0]).map(val => val / vectors.length);
  });
  
  // Calculate similarity matrix between sentences
  const similarityMatrix = calculateCosineSimilarityMatrix(sentenceVectors);
  
  return {
    sentences,
    wordVectors,
    sentenceVectors,
    similarityMatrix
  };
}

/**
 * Compare embeddings using different methods
 */
function compareEmbeddings(sentence1, sentence2) {
  const sentences = [sentence1, sentence2];
  
  // One-Hot encoding comparison
  const tokens1 = tokenize(sentence1);
  const tokens2 = tokenize(sentence2);
  const allTokens = [...new Set([...tokens1, ...tokens2])].sort();
  
  // Create document vectors using one-hot sum approach
  const docOneHot1 = Array(allTokens.length).fill(0);
  const docOneHot2 = Array(allTokens.length).fill(0);
  
  tokens1.forEach(token => {
    const idx = allTokens.indexOf(token);
    docOneHot1[idx]++;
  });
  
  tokens2.forEach(token => {
    const idx = allTokens.indexOf(token);
    docOneHot2[idx]++;
  });
  
  const oneHotSimilarity = cosineSimilarity(docOneHot1, docOneHot2);
  
  // Bag of Words comparison (same as one-hot for two documents)
  const bowSimilarity = oneHotSimilarity;
  
  // TF-IDF comparison
  const tfidfResult = tfidf(sentences);
  const tfidfSimilarity = tfidfResult.similarityMatrix[0][1];
  
  // Word embeddings comparison
  const wordEmbeddingsResult = wordEmbeddings(sentences);
  const embeddingSimilarity = wordEmbeddingsResult.similarityMatrix[0][1];
  
  return {
    sentence1,
    sentence2,
    similarities: {
      oneHot: roundToFourDecimals(oneHotSimilarity),
      bagOfWords: roundToFourDecimals(bowSimilarity),
      tfidf: roundToFourDecimals(tfidfSimilarity),
      wordEmbeddings: roundToFourDecimals(embeddingSimilarity)
    },
    bestMethod: getBestMethod({
      'One-Hot': oneHotSimilarity,
      'Bag of Words': bowSimilarity,
      'TF-IDF': tfidfSimilarity,
      'Word Embeddings': embeddingSimilarity
    }),
    analysis: getAnalysis(oneHotSimilarity, tfidfSimilarity, embeddingSimilarity)
  };
}

// Helper functions

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)             // Split on whitespace
    .filter(token => token.length > 0);
}

function calculateCosineSimilarityMatrix(vectors) {
  const n = vectors.length;
  const similarityMatrix = Array(n).fill().map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      similarityMatrix[i][j] = roundToFourDecimals(cosineSimilarity(vectors[i], vectors[j]));
    }
  }
  
  return similarityMatrix;
}

function cosineSimilarity(vecA, vecB) {
  // Handle zero vectors
  if (isZeroVector(vecA) || isZeroVector(vecB)) {
    return 0;
  }
  
  const dotProduct = math.dot(vecA, vecB);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
  // Prevent division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

function isZeroVector(vec) {
  return vec.every(val => val === 0);
}

function countNonZeroValues(matrix) {
  return matrix.reduce((count, vector) => {
    return count + vector.filter(val => val !== 0).length;
  }, 0);
}

function calculateSparsity(matrix, numRows, numCols) {
  const totalElements = numRows * numCols;
  const nonZero = countNonZeroValues(matrix);
  return Math.round(((totalElements - nonZero) / totalElements) * 100);
}

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function getBestMethod(methodScores) {
  let best = '';
  let highestScore = -1;
  
  for (const [method, score] of Object.entries(methodScores)) {
    if (score > highestScore) {
      highestScore = score;
      best = method;
    }
  }
  
  return best;
}

function getAnalysis(oneHotSimilarity, tfidfSimilarity, embeddingSimilarity) {
  const analysis = [];
  
  if (oneHotSimilarity > 0.7) {
    analysis.push("One-Hot encoding shows high similarity, suggesting significant word overlap between sentences.");
  } else {
    analysis.push("One-Hot encoding shows lower similarity, indicating different vocabularies in the sentences.");
  }
  
  if (tfidfSimilarity > embeddingSimilarity) {
    analysis.push("TF-IDF outperforms word embeddings, suggesting importance of specific terms rather than semantic meaning.");
  } else {
    analysis.push("Word embeddings outperform TF-IDF, suggesting sentences are semantically related even with different words.");
  }
  
  return analysis;
}

module.exports = {
  oneHotEncoding,
  bagOfWords,
  tfidf,
  wordEmbeddings,
  compareEmbeddings
};