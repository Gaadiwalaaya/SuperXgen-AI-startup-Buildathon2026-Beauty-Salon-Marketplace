import React, { useState, useEffect, useRef } from 'react';
import { trainingData as initialTrainingData } from '../data/trainingData';
import { buildVocabulary, textToBagOfWords, NeuralNetwork, trainNetworkAsync } from '../utils/neuralNet';
import { artists } from '../data/artists';

// Unique styles labels
const STYLES = ["Traditional", "Pastel", "Minimalist", "Bollywood", "Fusion"];

// Map predicted styles to MUAs
const STYLE_MUA_MAP = {
  "Traditional": "meenakshi-dutt",
  "Pastel": "kritika-gill",
  "Minimalist": "kritika-gill",
  "Bollywood": "guneet-virdi",
  "Fusion": "lodhi-wellness"
};

export default function AIStudio({ onBookMatch }) {
  const [activeTab, setActiveTab] = useState('train');
  const [trainingDataset, setTrainingDataset] = useState(initialTrainingData);
  
  // Custom training parameters
  const [epochs, setEpochs] = useState(200);
  const [learningRate, setLearningRate] = useState(0.05);
  const [hiddenNodes, setHiddenNodes] = useState(12);

  // Model references and states
  const [model, setModel] = useState(null);
  const [vocab, setVocab] = useState([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [currentLoss, setCurrentLoss] = useState(null);
  const [lossHistory, setLossHistory] = useState([]);
  const [isTrained, setIsTrained] = useState(false);

  // Add new training line
  const [newText, setNewText] = useState('');
  const [newStyle, setNewStyle] = useState('Traditional');

  // Inference states
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Namaste! Describe your ideal bridal outfit, makeup desires, or wedding theme. Our local neural network will classify your style and match you with the perfect Delhi artist!' }
  ]);
  const [predictions, setPredictions] = useState([]);
  const [matchedArtist, setMatchedArtist] = useState(null);

  const canvasRef = useRef(null);

  // Initialize vocabulary and model on mount
  useEffect(() => {
    const v = buildVocabulary(trainingDataset);
    setVocab(v);
    const net = new NeuralNetwork(v.length, hiddenNodes, STYLES.length, STYLES);
    setModel(net);
  }, [trainingDataset, hiddenNodes]);

  // Redraw loss chart canvas when loss history changes
  useEffect(() => {
    if (lossHistory.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Plot loss curve
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxLoss = Math.max(...lossHistory) || 1;
    const minLoss = Math.min(...lossHistory) || 0;
    const lossRange = (maxLoss - minLoss) || 1;

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    lossHistory.forEach((loss, idx) => {
      const x = padding + (idx / (lossHistory.length - 1)) * chartWidth;
      // Flip coordinates since y=0 is top in HTML5 canvas
      const y = padding + chartHeight - ((loss - minLoss) / lossRange) * chartHeight;
      
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill under the loss curve
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(212, 175, 55, 0.15)');
    grad.addColorStop(1, 'rgba(128, 0, 32, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

  }, [lossHistory]);

  // Handler to add custom training samples
  const handleAddSample = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const updated = [...trainingDataset, { text: newText.toLowerCase(), style: newStyle }];
    setTrainingDataset(updated);
    setNewText('');
    setIsTrained(false); // require retraining
    alert("New sample added to dataset! Retrain the model to save updates.");
  };

  // Train neural network in browser asynchronously
  const handleTrainModel = async () => {
    if (!model || isTraining) return;
    setIsTraining(true);
    setLossHistory([]);
    setTrainingProgress(0);

    // Prepare inputs
    const X = [];
    const Y = [];
    trainingDataset.forEach(item => {
      X.push(textToBagOfWords(item.text, vocab));
      
      // One-hot encode label
      const oneHot = new Array(STYLES.length).fill(0);
      const labelIdx = STYLES.indexOf(item.style);
      if (labelIdx !== -1) {
        oneHot[labelIdx] = 1;
      }
      Y.push(oneHot);
    });

    // Run async generator training loop
    const generator = trainNetworkAsync(model, X, Y, epochs, learningRate, 5);
    
    const run = () => {
      const result = generator.next();
      if (!result.done) {
        const { epoch, loss } = result.value;
        setCurrentLoss(loss);
        setLossHistory(prev => [...prev, loss]);
        setTrainingProgress(Math.round((epoch / epochs) * 100));
        
        // Use setTimeout to yield execution back to browser for rendering
        setTimeout(run, 15);
      } else {
        setIsTraining(false);
        setIsTrained(true);
        setCurrentLoss(lossHistory[lossHistory.length - 1]);
        alert("Maharani-LLM trained successfully! Try the Inference Chat.");
      }
    };
    
    run();
  };

  // Perform inference on user prompt
  const handleInference = () => {
    if (!userInput.trim()) return;
    if (!isTrained) {
      alert("Please train the neural network model on the Train tab first!");
      return;
    }

    const inputVector = textToBagOfWords(userInput, vocab);
    const results = model.predict(inputVector);
    setPredictions(results);

    // Get the top prediction
    const topResult = results[0];
    const topStyle = topResult.label;

    // Resolve artist ID and info
    const matchedMUAId = STYLE_MUA_MAP[topStyle];
    const artistMatch = artists.find(a => a.id === matchedMUAId);
    setMatchedArtist(artistMatch);

    // Update messages
    const newMsgs = [
      ...chatMessages,
      { sender: 'user', text: userInput },
      { 
        sender: 'ai', 
        text: `Based on your description, I have classified your style as: **${topStyle}** (${topResult.confidence}% match). \n\nI recommend matching with **${artistMatch.name}** in ${artistMatch.location}, who specializes in this theme.`
      }
    ];
    setChatMessages(newMsgs);
    setUserInput('');
  };

  return (
    <section>
      <div style={{ marginBottom: '30px', textAlign: 'left' }}>
        <h3 className="ai-studio-title font-serif">Bridal Muse AI Studio</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Fully client-side Neural Network suite. Train a machine learning model on your own local dataset to predict bridal looks.
        </p>
      </div>

      <div className="ai-tab-buttons">
        <button 
          className={`ai-tab-btn ${activeTab === 'train' ? 'active' : ''}`}
          onClick={() => setActiveTab('train')}
        >
          1. Train local Neural Network
        </button>
        <button 
          className={`ai-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          2. Style Inference Chat
        </button>
      </div>

      {activeTab === 'train' && (
        <div className="ai-layout">
          {/* Neural Net Hyperparameter Tuning */}
          <div className="glass-card ai-card" style={{ textAlign: 'left' }}>
            <h4 className="font-serif" style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--gold-primary)' }}>1. Model Configuration</h4>
            
            <div className="hyperparam-grid">
              <div className="param-group">
                <label>Epochs: {epochs}</label>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="50"
                  value={epochs}
                  onChange={e => setEpochs(Number(e.target.value))}
                  disabled={isTraining}
                  style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
                />
              </div>
              <div className="param-group">
                <label>Learning Rate: {learningRate}</label>
                <input 
                  type="range" 
                  min="0.01" 
                  max="0.2" 
                  step="0.01"
                  value={learningRate}
                  onChange={e => setLearningRate(Number(e.target.value))}
                  disabled={isTraining}
                  style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
                />
              </div>
            </div>

            <div className="hyperparam-grid" style={{ marginBottom: '25px' }}>
              <div className="param-group">
                <label>Hidden Neurons: {hiddenNodes}</label>
                <select 
                  className="select-input"
                  value={hiddenNodes}
                  onChange={e => setHiddenNodes(Number(e.target.value))}
                  disabled={isTraining}
                >
                  <option value="6">6 Neurons</option>
                  <option value="12">12 Neurons (Default)</option>
                  <option value="20">20 Neurons</option>
                </select>
              </div>
              <div className="param-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  className="crimson-btn" 
                  onClick={handleTrainModel}
                  disabled={isTraining}
                  style={{ width: '100%', padding: '12px' }}
                >
                  {isTraining ? `Training ${trainingProgress}%` : 'Train Neural Net'}
                </button>
              </div>
            </div>

            {/* Live Graph plotting */}
            <div className="loss-chart-wrapper">
              <div className="loss-chart-header">
                <span>Loss Optimization Chart</span>
                <span>{currentLoss !== null ? `Current Loss: ${currentLoss.toFixed(4)}` : 'Model Untrained'}</span>
              </div>
              {/* Fallback rendering when no history is present */}
              {lossHistory.length === 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyAlignment: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Click "Train Neural Net" to view the convergence graph.
                </div>
              )}
              <canvas ref={canvasRef} className="loss-canvas" width="400" height="220"></canvas>
            </div>
          </div>

          {/* Dataset View and additions */}
          <div className="glass-card ai-card" style={{ textAlign: 'left' }}>
            <h4 className="font-serif" style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--gold-primary)' }}>2. Training Dataset</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '15px' }}>
              Currently training on {trainingDataset.length} textual descriptors.
            </p>

            <form onSubmit={handleAddSample} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Add text descriptor (e.g. heavy gold, red lehenga...)" 
                className="select-input" 
                value={newText} 
                onChange={e => setNewText(e.target.value)}
                style={{ flex: 2 }}
              />
              <select 
                className="select-input" 
                value={newStyle} 
                onChange={e => setNewStyle(e.target.value)}
                style={{ flex: 1 }}
              >
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="luxe-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                Add Sample
              </button>
            </form>

            <div className="dataset-table-wrapper">
              <table className="dataset-table">
                <thead>
                  <tr>
                    <th>Sample Description Token</th>
                    <th>Assigned Look Style</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingDataset.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-secondary)' }}>"{item.text}"</td>
                      <td style={{ fontWeight: '600', color: 'var(--gold-light)' }}>{item.style}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="ai-layout">
          {/* Chat box panel */}
          <div className="glass-card chat-window">
            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.sender}`}>
                  {msg.text.split('\n\n').map((para, pidx) => (
                    <p key={pidx} style={{ marginBottom: pidx < msg.text.split('\n\n').length - 1 ? '10px' : 0 }}>
                      {para}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="chat-input-row">
              <input 
                type="text" 
                className="chat-input"
                placeholder={isTrained ? "Describe your bridal style..." : "Please train model on the first tab first."}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInference()}
                disabled={!isTrained}
              />
              <button 
                className="crimson-btn" 
                style={{ padding: '8px 24px', borderRadius: '30px' }}
                onClick={handleInference}
                disabled={!isTrained}
              >
                Ask AI
              </button>
            </div>
          </div>

          {/* Predictions and Match details */}
          <div className="glass-card ai-card" style={{ textAlign: 'left' }}>
            <h4 className="font-serif" style={{ fontSize: '22px', marginBottom: '20px', color: 'var(--gold-primary)' }}>Style Probabilities</h4>
            
            {predictions.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '40px' }}>
                Type in the chat window to trigger model predictions.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '30px' }}>
                  {predictions.map(pred => (
                    <div key={pred.label} className="style-prob-bar">
                      <div className="style-prob-labels">
                        <span style={{ fontWeight: '500' }}>{pred.label}</span>
                        <span className="gold-gradient-text" style={{ fontWeight: '600' }}>{pred.confidence}%</span>
                      </div>
                      <div className="style-prob-track">
                        <div className="style-prob-fill" style={{ width: `${pred.confidence}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {matchedArtist && (
                  <div className="prediction-bubble" style={{ border: '1.5px solid var(--gold-primary)' }}>
                    <h5 className="font-serif gold-gradient-text" style={{ fontSize: '18px', marginBottom: '8px' }}>Matched Delhi MUA</h5>
                    <h6 style={{ fontSize: '16px', color: '#fff', marginBottom: '4px' }}>{matchedArtist.name}</h6>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>📍 {matchedArtist.location}</p>
                    <button 
                      className="crimson-btn" 
                      style={{ width: '100%', padding: '10px' }}
                      onClick={() => onBookMatch(matchedArtist)}
                    >
                      Book Suggested Match
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
