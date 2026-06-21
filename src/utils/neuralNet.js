// Custom Feedforward Neural Network in pure JS for client-side training

// Tokenizer and stop words
const STOP_WORDS = new Set(["i", "want", "a", "with", "and", "the", "in", "to", "for", "on", "of", "my", "is", "it"]);

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

export function buildVocabulary(data) {
  const vocabSet = new Set();
  data.forEach(item => {
    const tokens = tokenize(item.text);
    tokens.forEach(token => vocabSet.add(token));
  });
  return Array.from(vocabSet);
}

export function textToBagOfWords(text, vocab) {
  const tokens = tokenize(text);
  const vector = new Array(vocab.length).fill(0);
  tokens.forEach(token => {
    const idx = vocab.indexOf(token);
    if (idx !== -1) {
      vector[idx] = 1;
    }
  });
  return vector;
}

// Matrix helper utilities
function randomMatrix(rows, cols) {
  const mat = [];
  // He initialization (standard dev = sqrt(2/input_size))
  const std = Math.sqrt(2 / rows);
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const randNorm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      row.push(randNorm * std);
    }
    mat.push(row);
  }
  return mat;
}

function zerosVector(size) {
  return new Array(size).fill(0);
}

function relu(x) {
  return Math.max(0, x);
}

function softmax(arr) {
  const maxVal = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - maxVal));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / (sumExps || 1));
}

export class NeuralNetwork {
  constructor(vocabSize, hiddenSize, outputSize, labels) {
    this.vocabSize = vocabSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.labels = labels; // Array of style labels, e.g., ["Traditional", "Pastel", "Minimalist", "Bollywood", "Fusion"]

    // Parameters
    this.W1 = randomMatrix(vocabSize, hiddenSize);
    this.b1 = zerosVector(hiddenSize);
    this.W2 = randomMatrix(hiddenSize, outputSize);
    this.b2 = zerosVector(outputSize);
  }

  forward(x) {
    // Hidden Layer: Z1 = x * W1 + b1
    const z1 = [...this.b1];
    for (let h = 0; h < this.hiddenSize; h++) {
      for (let v = 0; v < this.vocabSize; v++) {
        z1[h] += x[v] * this.W1[v][h];
      }
    }

    // Activation: A1 = relu(Z1)
    const a1 = z1.map(relu);

    // Output Layer: Z2 = a1 * W2 + b2
    const z2 = [...this.b2];
    for (let o = 0; o < this.outputSize; o++) {
      for (let h = 0; h < this.hiddenSize; h++) {
        z2[o] += a1[h] * this.W2[h][o];
      }
    }

    // Activation: A2 = softmax(Z2)
    const a2 = softmax(z2);

    return { z1, a1, z2, a2 };
  }

  // Multi-class cross-entropy loss backpropagation
  // Runs a single epoch and returns average loss
  trainEpoch(X, Y, learningRate) {
    let totalLoss = 0;
    const n = X.length;

    // Accumulators for gradients
    const dW1 = Array(this.vocabSize).fill(0).map(() => Array(this.hiddenSize).fill(0));
    const db1 = zerosVector(this.hiddenSize);
    const dW2 = Array(this.hiddenSize).fill(0).map(() => Array(this.outputSize).fill(0));
    const db2 = zerosVector(this.outputSize);

    for (let i = 0; i < n; i++) {
      const x = X[i];
      const y = Y[i]; // One-hot vector

      // Forward pass
      const { z1, a1, a2 } = this.forward(x);

      // Compute Cross Entropy Loss
      const labelIdx = y.indexOf(1);
      const prob = Math.max(a2[labelIdx], 1e-15);
      totalLoss -= Math.log(prob);

      // Output Error: dZ2 = a2 - y
      const dZ2 = new Array(this.outputSize);
      for (let o = 0; o < this.outputSize; o++) {
        dZ2[o] = a2[o] - y[o];
      }

      // Gradients for Output weights and biases
      for (let h = 0; h < this.hiddenSize; h++) {
        for (let o = 0; o < this.outputSize; o++) {
          dW2[h][o] += a1[h] * dZ2[o];
        }
      }
      for (let o = 0; o < this.outputSize; o++) {
        db2[o] += dZ2[o];
      }

      // Hidden Error: dZ1 = (dZ2 * W2^T) * relu_derivative(z1)
      const dZ1 = zerosVector(this.hiddenSize);
      for (let h = 0; h < this.hiddenSize; h++) {
        let sum = 0;
        for (let o = 0; o < this.outputSize; o++) {
          sum += dZ2[o] * this.W2[h][o];
        }
        dZ1[h] = z1[h] > 0 ? sum : 0; // relu derivative is 1 if z1 > 0 else 0
      }

      // Gradients for Hidden weights and biases
      for (let v = 0; v < this.vocabSize; v++) {
        for (let h = 0; h < this.hiddenSize; h++) {
          dW1[v][h] += x[v] * dZ1[h];
        }
      }
      for (let h = 0; h < this.hiddenSize; h++) {
        db1[h] += dZ1[h];
      }
    }

    // Parameter updates using GD (averaged over the dataset size)
    for (let h = 0; h < this.hiddenSize; h++) {
      for (let o = 0; o < this.outputSize; o++) {
        this.W2[h][o] -= (learningRate * dW2[h][o]) / n;
      }
      this.b2[h] -= (learningRate * db2[h]) / n;
    }

    for (let v = 0; v < this.vocabSize; v++) {
      for (let h = 0; h < this.hiddenSize; h++) {
        this.W1[v][h] -= (learningRate * dW1[v][h]) / n;
      }
    }
    for (let h = 0; h < this.hiddenSize; h++) {
      this.b1[h] -= (learningRate * db1[h]) / n;
    }

    return totalLoss / n;
  }

  // Predict outputs
  predict(x) {
    const { a2 } = this.forward(x);
    // Combine labels with confidence percentages
    return this.labels.map((label, idx) => ({
      label,
      confidence: Math.round(a2[idx] * 100)
    })).sort((a, b) => b.confidence - a.confidence);
  }
}

// Generator function for asynchronous training in React.
// Yields current epoch and loss so the UI can update and render smoothly.
export function* trainNetworkAsync(net, X, Y, epochs, learningRate, yieldEvery = 5) {
  for (let epoch = 1; epoch <= epochs; epoch++) {
    const loss = net.trainEpoch(X, Y, learningRate);
    if (epoch === 1 || epoch % yieldEvery === 0 || epoch === epochs) {
      yield { epoch, loss };
    }
  }
}
