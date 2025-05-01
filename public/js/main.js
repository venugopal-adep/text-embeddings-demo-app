// main.js - Client-side JavaScript for Text Embedding Models Demo

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');
  
  // Improved debugging
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', { message, source, lineno, colno, error: error?.stack });
    return false;
  };
  
  // Wait for a short time to ensure Bootstrap is fully initialized
  setTimeout(() => {
    // One-Hot Encoding
    const oneHotAnalyzeBtn = document.getElementById('oneHotAnalyzeBtn');
    if (oneHotAnalyzeBtn) {
      console.log('One-Hot Encoding button found, attaching event listener');
      oneHotAnalyzeBtn.addEventListener('click', analyzeOneHot);
    } else {
      console.error('oneHotAnalyzeBtn element not found');
    }
    
    // Bag of Words
    const bowAnalyzeBtn = document.getElementById('bowAnalyzeBtn');
    if (bowAnalyzeBtn) {
      console.log('Bag of Words button found, attaching event listener');
      bowAnalyzeBtn.addEventListener('click', analyzeBoW);
    } else {
      console.error('bowAnalyzeBtn element not found');
    }
    
    // TF-IDF
    const tfidfAnalyzeBtn = document.getElementById('tfidfAnalyzeBtn');
    if (tfidfAnalyzeBtn) {
      console.log('TF-IDF button found, attaching event listener');
      tfidfAnalyzeBtn.addEventListener('click', analyzeTfIdf);
    } else {
      console.error('tfidfAnalyzeBtn element not found');
    }
    
    // Word Embeddings
    const embeddingAnalyzeBtn = document.getElementById('embeddingAnalyzeBtn');
    if (embeddingAnalyzeBtn) {
      console.log('Word Embeddings button found, attaching event listener');
      embeddingAnalyzeBtn.addEventListener('click', analyzeWordEmbeddings);
    } else {
      console.error('embeddingAnalyzeBtn element not found');
    }
    
    // Compare Methods
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
      console.log('Compare button found, attaching event listener');
      compareBtn.addEventListener('click', compareEmbeddings);
    } else {
      console.error('compareBtn element not found');
    }
    
    console.log('All event listeners attached');
  }, 500);
});

// One-Hot Encoding Analysis
async function analyzeOneHot() {
  const text = document.getElementById('oneHotText').value;
  console.log('One-Hot Encoding button clicked with text:', text);
  
  if (!text.trim()) {
    alert('Please enter some text to analyze');
    return;
  }
  
  try {
    console.log('Making One-Hot Encoding API request with data:', { text });
    const response = await fetch('/api/one-hot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    console.log('One-Hot Encoding API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('One-Hot Encoding API response data:', result);
    displayOneHotResults(result);
  } catch (error) {
    console.error('Error analyzing one-hot encoding:', error);
    alert(`An error occurred while analyzing the text: ${error.message}`);
  }
}

function displayOneHotResults(data) {
  // Display results section
  document.getElementById('oneHotResults').style.display = 'block';
  
  // Display statistics
  const statsHtml = `
    <div class="alert alert-secondary">
      <p><strong>Vocabulary size:</strong> ${data.vocabularySize}</p>
      <p><strong>Total dimensions:</strong> ${data.dimensions} (vocabulary size × sequence length)</p>
      <p><strong>Unique words:</strong> ${data.uniqueTokens.join(', ')}</p>
    </div>
  `;
  document.getElementById('oneHotStats').innerHTML = statsHtml;
  
  // Build table
  const table = document.getElementById('oneHotTable');
  
  // Clear existing table content
  table.querySelector('thead tr').innerHTML = '<th>Word</th>';
  table.querySelector('tbody').innerHTML = '';
  
  // Add table headers for each dimension
  data.uniqueTokens.forEach((token, idx) => {
    const th = document.createElement('th');
    th.textContent = token;
    table.querySelector('thead tr').appendChild(th);
  });
  
  // Add rows for each token
  data.tokens.forEach((token, rowIdx) => {
    const tr = document.createElement('tr');
    
    // Add word column
    const tdWord = document.createElement('td');
    tdWord.textContent = token;
    tr.appendChild(tdWord);
    
    // Add vector values
    data.encodings[rowIdx].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      td.style.backgroundColor = value === 1 ? 'rgba(75, 192, 192, 0.6)' : '';
      tr.appendChild(td);
    });
    
    table.querySelector('tbody').appendChild(tr);
  });
  
  // Create visualization
  const ctx = document.getElementById('oneHotChart').getContext('2d');
  
  // Properly destroy previous chart if it exists
  if (window.oneHotChart instanceof Chart) {
    window.oneHotChart.destroy();
    window.oneHotChart = null;
  } else if (Chart.getChart(ctx.canvas)) {
    Chart.getChart(ctx.canvas).destroy();
  }
  
  // Prepare data for heatmap
  const labels = data.tokens.map((_, idx) => `Position ${idx + 1}`);
  
  // Create a color scale
  const colorScale = (value) => value === 1 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 255, 255, 0.5)';
  
  // Create datasets for a bar chart representation
  const datasets = [];
  data.uniqueTokens.forEach((token, tokenIdx) => {
    const dataset = {
      label: token,
      data: data.encodings.map(encoding => encoding[tokenIdx]),
      backgroundColor: data.encodings.map(encoding => colorScale(encoding[tokenIdx])),
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      barPercentage: 0.9,
      categoryPercentage: 0.9
    };
    datasets.push(dataset);
  });
  
  window.oneHotChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              return `Position: ${tooltipItems[0].label}`;
            },
            label: function(context) {
              const value = context.raw;
              const tokenIndex = context.datasetIndex;
              const token = data.uniqueTokens[tokenIndex];
              return `Word: ${token}, Value: ${value}`;
            }
          }
        },
        title: {
          display: true,
          text: 'One-Hot Encoding Visualization'
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Sequence Position'
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: 'Value (0 or 1)'
          }
        }
      }
    }
  });
}

// Bag of Words Analysis
async function analyzeBoW() {
  const text = document.getElementById('bowText').value;
  console.log('Bag of Words button clicked with text:', text);
  
  if (!text.trim()) {
    alert('Please enter some text to analyze');
    return;
  }
  
  const documents = text.split('\n').filter(line => line.trim());
  console.log('Parsed documents:', documents);
  
  if (documents.length < 1) {
    alert('Please enter at least one line of text');
    return;
  }
  
  try {
    console.log('Making Bag of Words API request with data:', { documents });
    const response = await fetch('/api/bag-of-words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ documents })
    });
    
    console.log('Bag of Words API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('Bag of Words API response data:', result);
    displayBoWResults(result);
  } catch (error) {
    console.error('Error analyzing bag of words:', error);
    alert(`An error occurred while analyzing the text: ${error.message}`);
  }
}

function displayBoWResults(data) {
  // Display results section
  document.getElementById('bowResults').style.display = 'block';
  
  // Display statistics
  const statsHtml = `
    <div class="alert alert-secondary">
      <p><strong>Vocabulary size:</strong> ${data.vocabularySize}</p>
      <p><strong>Total non-zero values:</strong> ${data.nonZeroValues} (out of ${data.documents.length * data.vocabularySize} possible)</p>
      <p><strong>Sparsity:</strong> ${data.sparsity}%</p>
    </div>
  `;
  document.getElementById('bowStats').innerHTML = statsHtml;
  
  // Build the BoW matrix table
  const table = document.getElementById('bowTable');
  
  // Clear existing table content
  table.querySelector('thead tr').innerHTML = '<th>Document</th>';
  table.querySelector('tbody').innerHTML = '';
  
  // Add table headers for each word
  data.uniqueTokens.forEach(token => {
    const th = document.createElement('th');
    th.textContent = token;
    table.querySelector('thead tr').appendChild(th);
  });
  
  // Add rows for each document
  data.documents.forEach((doc, idx) => {
    const tr = document.createElement('tr');
    
    // Add document column
    const tdDoc = document.createElement('td');
    tdDoc.textContent = `Document ${idx + 1}`;
    tr.appendChild(tdDoc);
    
    // Add count values
    data.countVectors[idx].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      
      // Color non-zero cells
      if (value > 0) {
        const intensity = Math.min(value * 0.5, 1);
        td.style.backgroundColor = `rgba(54, 162, 235, ${intensity})`;
      }
      
      tr.appendChild(td);
    });
    
    table.querySelector('tbody').appendChild(tr);
  });
  
  // Create BoW visualization
  const ctx = document.getElementById('bowChart').getContext('2d');
  
  // Properly destroy previous chart if it exists
  if (window.bowChart instanceof Chart) {
    window.bowChart.destroy();
    window.bowChart = null;
  } else if (Chart.getChart(ctx.canvas)) {
    Chart.getChart(ctx.canvas).destroy();
  }
  
  window.bowChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.uniqueTokens,
      datasets: data.documents.map((doc, idx) => {
        return {
          label: `Document ${idx + 1}`,
          data: data.countVectors[idx],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ][idx % 4],
          borderWidth: 1
        };
      })
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Bag of Words Visualization'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Words'
          }
        }
      }
    }
  });
  
  // Create similarity matrix visualization
  const simCtx = document.getElementById('bowSimilarityChart').getContext('2d');
  
  // Properly destroy previous chart if it exists
  if (window.bowSimChart instanceof Chart) {
    window.bowSimChart.destroy();
    window.bowSimChart = null;
  } else if (Chart.getChart(simCtx.canvas)) {
    Chart.getChart(simCtx.canvas).destroy();
  }
  
  window.bowSimChart = createSimilarityChart(simCtx, data.similarityMatrix, data.documents.length);
}

// TF-IDF Analysis
async function analyzeTfIdf() {
  const text = document.getElementById('tfidfText').value;
  console.log('TF-IDF button clicked with text:', text);
  
  if (!text.trim()) {
    alert('Please enter some text to analyze');
    return;
  }
  
  const documents = text.split('\n').filter(line => line.trim());
  console.log('Parsed documents:', documents);
  
  if (documents.length < 2) {
    alert('Please enter at least two lines of text for meaningful TF-IDF analysis');
    return;
  }
  
  try {
    console.log('Making TF-IDF API request with data:', { documents });
    const response = await fetch('/api/tfidf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ documents })
    });
    
    console.log('TF-IDF API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('TF-IDF API response data:', result);
    displayTfIdfResults(result);
  } catch (error) {
    console.error('Error analyzing TF-IDF:', error);
    alert(`An error occurred while analyzing the text: ${error.message}`);
  }
}

function displayTfIdfResults(data) {
  // Display results section
  document.getElementById('tfidfResults').style.display = 'block';
  
  // Build the TF-IDF matrix table
  const table = document.getElementById('tfidfTable');
  
  // Clear existing table content
  table.querySelector('thead tr').innerHTML = '<th>Document</th>';
  table.querySelector('tbody').innerHTML = '';
  
  // Add table headers for each term
  data.terms.forEach(term => {
    const th = document.createElement('th');
    th.textContent = term;
    table.querySelector('thead tr').appendChild(th);
  });
  
  // Add rows for each document
  data.documents.forEach((doc, idx) => {
    const tr = document.createElement('tr');
    
    // Add document column
    const tdDoc = document.createElement('td');
    tdDoc.textContent = `Document ${idx + 1}`;
    tr.appendChild(tdDoc);
    
    // Add TF-IDF values
    data.tfidfMatrix[idx].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value.toFixed(2);
      
      // Color non-zero cells
      if (value > 0) {
        const intensity = Math.min(value * 0.7, 1);
        td.style.backgroundColor = `rgba(255, 159, 64, ${intensity})`;
      }
      
      tr.appendChild(td);
    });
    
    table.querySelector('tbody').appendChild(tr);
  });
  
  // Create TF-IDF visualization
  const ctx = document.getElementById('tfidfChart').getContext('2d');
  
  // Properly destroy previous chart if it exists
  if (window.tfidfChart instanceof Chart) {
    window.tfidfChart.destroy();
    window.tfidfChart = null;
  } else if (Chart.getChart(ctx.canvas)) {
    Chart.getChart(ctx.canvas).destroy();
  }
  
  window.tfidfChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.terms,
      datasets: data.documents.map((doc, idx) => {
        return {
          label: `Document ${idx + 1}`,
          data: data.tfidfMatrix[idx],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ][idx % 4],
          borderWidth: 1
        };
      })
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'TF-IDF Visualization'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'TF-IDF Score'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Terms'
          }
        }
      }
    }
  });
  
  // Create similarity matrix visualization
  const simCtx = document.getElementById('tfidfSimilarityChart').getContext('2d');
  
  // Properly destroy previous chart if it exists
  if (window.tfidfSimChart instanceof Chart) {
    window.tfidfSimChart.destroy();
    window.tfidfSimChart = null;
  } else if (Chart.getChart(simCtx.canvas)) {
    Chart.getChart(simCtx.canvas).destroy();
  }
  
  window.tfidfSimChart = createSimilarityChart(simCtx, data.similarityMatrix, data.documents.length);
}

// Word Embeddings Analysis
async function analyzeWordEmbeddings() {
  const text = document.getElementById('embeddingText').value;
  console.log('Word Embeddings button clicked with text:', text);
  
  if (!text.trim()) {
    alert('Please enter some text to analyze');
    return;
  }
  
  const sentences = text.split('\n').filter(line => line.trim());
  console.log('Parsed sentences:', sentences);
  
  if (sentences.length < 1) {
    alert('Please enter at least one line of text');
    return;
  }
  
  try {
    console.log('Making Word Embeddings API request with data:', { sentences });
    const response = await fetch('/api/word-embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentences })
    });
    
    console.log('Word Embeddings API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('Word Embeddings API response data:', result);
    displayWordEmbeddingsResults(result);
  } catch (error) {
    console.error('Error analyzing word embeddings:', error);
    alert(`An error occurred while analyzing the text: ${error.message}`);
  }
}

function displayWordEmbeddingsResults(data) {
  // Display results section
  document.getElementById('embeddingResults').style.display = 'block';
  
  // Build the sentence embeddings table
  const table = document.getElementById('embeddingTable');
  
  // Clear existing table content
  table.querySelector('tbody').innerHTML = '';
  
  // Add rows for each sentence
  data.sentences.forEach((sentence, idx) => {
    const tr = document.createElement('tr');
    
    // Add sentence column
    const tdSentence = document.createElement('td');
    tdSentence.textContent = sentence;
    tr.appendChild(tdSentence);
    
    // Add embedding dimensions
    data.sentenceVectors[idx].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value.toFixed(4);
      tr.appendChild(td);
    });
    
    table.querySelector('tbody').appendChild(tr);
  });
  
  // Create 2D embedding visualization
  const container = document.getElementById('embeddingVisualization');
  container.innerHTML = '';
  
  // Extract words and vectors from the wordVectors object
  const words = Object.keys(data.wordVectors);
  const vectors = words.map(word => data.wordVectors[word]);
  
  // Set the dimensions and margins of the graph
  const margin = {top: 20, right: 20, bottom: 30, left: 40};
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  
  // Append the svg object to the container
  const svg = d3.select('#embeddingVisualization')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Add X axis
  const x = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));
  
  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);
  svg.append('g')
    .call(d3.axisLeft(y));
  
  // Add X axis label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom)
    .style('text-anchor', 'middle')
    .text('Dimension 1');
  
  // Add Y axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Dimension 2');
  
  // Add title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text('Word Embeddings Visualization');
  
  // Add dots for words
  svg.selectAll('dot')
    .data(words)
    .enter()
    .append('circle')
      .attr('cx', (d, i) => x(vectors[i][0]))
      .attr('cy', (d, i) => y(vectors[i][1]))
      .attr('r', 5)
      .style('fill', '#69b3a2')
      .style('opacity', 0.7);
  
  // Add labels for words
  svg.selectAll('text.word')
    .data(words)
    .enter()
    .append('text')
      .attr('class', 'word')
      .attr('x', (d, i) => x(vectors[i][0]) + 7)
      .attr('y', (d, i) => y(vectors[i][1]) + 3)
      .text(d => d)
      .style('font-size', '10px');
  
  // Add sentence vectors as larger dots
  svg.selectAll('dot.sentence')
    .data(data.sentenceVectors)
    .enter()
    .append('circle')
      .attr('cx', d => x(d[0]))
      .attr('cy', d => y(d[1]))
      .attr('r', 8)
      .style('fill', '#e41a1c')
      .style('opacity', 0.7);
  
  // Add labels for sentences
  svg.selectAll('text.sentence')
    .data(data.sentences)
    .enter()
    .append('text')
      .attr('class', 'sentence')
      .attr('x', (d, i) => x(data.sentenceVectors[i][0]) + 10)
      .attr('y', (d, i) => y(data.sentenceVectors[i][1]) + 3)
      .text((d, i) => `Sentence ${i + 1}`)
      .style('font-size', '12px')
      .style('font-weight', 'bold');
  
  // Create similarity matrix visualization
  const simCtx = document.getElementById('embeddingSimilarityChart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (window.embeddingSimChart) {
    window.embeddingSimChart.destroy();
  }
  
  window.embeddingSimChart = createSimilarityChart(simCtx, data.similarityMatrix, data.sentences.length);
}

// Compare Embedding Methods
async function compareEmbeddings() {
  const sentence1 = document.getElementById('sentence1').value;
  const sentence2 = document.getElementById('sentence2').value;
  console.log('Compare button clicked with sentences:', { sentence1, sentence2 });
  
  if (!sentence1.trim() || !sentence2.trim()) {
    alert('Please enter both sentences');
    return;
  }
  
  try {
    console.log('Making Compare API request with data:', { sentence1, sentence2 });
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentence1, sentence2 })
    });
    
    console.log('Compare API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('Compare API response data:', result);
    displayComparisonResults(result);
  } catch (error) {
    console.error('Error comparing embeddings:', error);
    alert(`An error occurred while comparing the sentences: ${error.message}`);
  }
}

function displayComparisonResults(data) {
  // Display results section
  document.getElementById('compareResults').style.display = 'block';
  
  // Display sentences and best method
  const statsHtml = `
    <div class="alert alert-secondary">
      <p><strong>Sentence 1:</strong> "${data.sentence1}"</p>
      <p><strong>Sentence 2:</strong> "${data.sentence2}"</p>
      <p><strong>Best method:</strong> ${data.bestMethod}</p>
    </div>
  `;
  document.getElementById('compareStats').innerHTML = statsHtml;
  
  // Display analysis
  const analysisHtml = `
    <div class="alert alert-primary">
      <h5>Analysis:</h5>
      <ul>
        ${data.analysis.map(point => `<li>${point}</li>`).join('')}
      </ul>
    </div>
  `;
  document.getElementById('compareAnalysis').innerHTML = analysisHtml;
  
  // Create comparison chart
  const ctx = document.getElementById('compareChart').getContext('2d');
  
  // Properly destroy previous chart if it exists
  if (window.compareChart instanceof Chart) {
    window.compareChart.destroy();
    window.compareChart = null;
  } else if (Chart.getChart(ctx.canvas)) {
    Chart.getChart(ctx.canvas).destroy();
  }
  
  const methods = ['One-Hot', 'Bag of Words', 'TF-IDF', 'Word Embeddings'];
  const values = [
    data.similarities.oneHot,
    data.similarities.bagOfWords,
    data.similarities.tfidf,
    data.similarities.wordEmbeddings
  ];
  
  window.compareChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: methods,
      datasets: [{
        label: 'Similarity Score',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Similarity Comparison Across Methods'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: 'Cosine Similarity'
          }
        }
      }
    }
  });
}

// Utility function to create a similarity matrix chart
function createSimilarityChart(ctx, similarityMatrix, numEntities) {
  const labels = Array(numEntities).fill().map((_, i) => `Entity ${i + 1}`);
  
  // Destroy the specific chart instance for this context if it exists
  let chartInstance = Chart.getChart(ctx.canvas);
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Create a heatmap-like visualization using a bar chart
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
  
  // Prepare datasets for a grouped bar chart
  const datasets = [];
  for (let i = 0; i < similarityMatrix.length; i++) {
    datasets.push({
      label: labels[i],
      data: similarityMatrix[i],
      backgroundColor: colors[i % colors.length],
      borderWidth: 1
    });
  }
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Similarity Matrix'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const fromIdx = context.datasetIndex;
              const toIdx = context.dataIndex;
              return `Similarity(${labels[fromIdx]}, ${labels[toIdx]}): ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Entity'
          }
        },
        y: {
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: 'Similarity Score'
          }
        }
      }
    }
  });
}