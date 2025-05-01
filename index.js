// index.js - Express server for Text Embedding Models Demo
const express = require('express');
const path = require('path');
const { 
  oneHotEncoding, 
  bagOfWords, 
  tfidf, 
  wordEmbeddings, 
  compareEmbeddings 
} = require('./embeddings');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Text Embedding Models' });
});

// API Endpoints
// One-Hot Encoding API
app.post('/api/one-hot', (req, res) => {
  try {
    const { text } = req.body;
    console.log('One-Hot Encoding request received:', text);
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid input. Please provide a text string.' });
    }
    
    const result = oneHotEncoding(text);
    res.json(result);
  } catch (error) {
    console.error('Error in one-hot encoding API:', error);
    res.status(500).json({ error: 'An error occurred while processing the text' });
  }
});

// Bag of Words API
app.post('/api/bag-of-words', (req, res) => {
  try {
    const { documents } = req.body;
    console.log('Bag of Words request received:', documents);
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'Invalid input. Please provide an array of document strings.' });
    }
    
    const result = bagOfWords(documents);
    res.json(result);
  } catch (error) {
    console.error('Error in bag of words API:', error);
    res.status(500).json({ error: 'An error occurred while processing the documents' });
  }
});

// TF-IDF API
app.post('/api/tfidf', (req, res) => {
  try {
    const { documents } = req.body;
    console.log('TF-IDF request received:', documents);
    
    if (!documents || !Array.isArray(documents) || documents.length < 2) {
      return res.status(400).json({ error: 'Invalid input. Please provide an array with at least two document strings.' });
    }
    
    const result = tfidf(documents);
    res.json(result);
  } catch (error) {
    console.error('Error in TF-IDF API:', error);
    res.status(500).json({ error: 'An error occurred while processing the documents' });
  }
});

// Word Embeddings API
app.post('/api/word-embeddings', (req, res) => {
  try {
    const { sentences } = req.body;
    console.log('Word Embeddings request received:', sentences);
    
    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return res.status(400).json({ error: 'Invalid input. Please provide an array of sentence strings.' });
    }
    
    const result = wordEmbeddings(sentences);
    res.json(result);
  } catch (error) {
    console.error('Error in word embeddings API:', error);
    res.status(500).json({ error: 'An error occurred while processing the sentences' });
  }
});

// Compare Embedding Methods API
app.post('/api/compare', (req, res) => {
  try {
    const { sentence1, sentence2 } = req.body;
    console.log('Compare request received:', { sentence1, sentence2 });
    
    if (!sentence1 || !sentence2 || typeof sentence1 !== 'string' || typeof sentence2 !== 'string') {
      return res.status(400).json({ error: 'Invalid input. Please provide two sentence strings.' });
    }
    
    const result = compareEmbeddings(sentence1, sentence2);
    res.json(result);
  } catch (error) {
    console.error('Error in compare embeddings API:', error);
    res.status(500).json({ error: 'An error occurred while comparing the sentences' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});