# Text Embeddings Demo App

## What is this?

This application demonstrates different ways computers can understand and process text, starting from simple methods to more advanced techniques. Think of it as a visual tour of how machines represent words and sentences as numbers (vectors) to perform tasks like finding similar texts or classifying content.

The app showcases four main text embedding techniques:

1. **One-Hot Encoding**: The simplest approach where each word is represented as a vector with mostly zeros and a single "1" in a unique position.

2. **Bag of Words**: Counts how many times each word appears in a document, ignoring order and grammar.

3. **TF-IDF**: Improves on Bag of Words by giving higher importance to words that are frequent in a document but rare across all documents.

4. **Word Embeddings**: More sophisticated representation where similar words appear close to each other in the vector space, capturing semantic relationships.

## Features

- Interactive visualizations of different embedding techniques
- Document similarity comparisons
- Side-by-side comparison of embedding methods
- Visual explanations of how each technique works

## Screenshots

The app allows you to:
- Enter your own text examples
- See how different embedding techniques represent the same text
- Compare the similarity between sentences using different methods
- Understand the strengths and weaknesses of each approach

## Getting Started

### Prerequisites

To run this application, you need:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/venugopal-adep/text-embeddings-demo-app.git
   ```

2. Navigate to the project directory:
   ```
   cd text-embeddings-app
   ```

3. Install dependencies:
   ```
   npm install
   ```

### Running the Application

Start the application with:
```
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000) in your web browser.

## How to Use

1. Open the application in your browser
2. Navigate through different embedding methods using the tabs
3. Enter text in the provided text areas
4. Click "Analyze" to see results
5. Compare different methods using the "Compare Methods" tab

## Why This Matters

Text embeddings are a fundamental concept in Natural Language Processing (NLP) and power many applications you use daily:
- Search engines
- Recommendation systems
- Chatbots and virtual assistants
- Content classification
- Language translation

Understanding these concepts helps demystify how machines process and "understand" human language.

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: HTML, CSS, JavaScript
- **Templating**: EJS
- **Libraries**: Chart.js, D3.js for visualizations
- **NLP**: Natural.js for text processing

## License

Apache 2.0

## Acknowledgments

This application was created as an educational tool to help understand text embedding concepts.
