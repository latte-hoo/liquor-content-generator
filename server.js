const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Chat API - proxy to Zhipu
app.post('/api/chat', async (req, res) => {
  const { apiKey, model, messages, temperature, max_tokens } = req.body;
  
  try {
    const resp = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'glm-4-flash',
        messages,
        temperature: temperature || 0.8,
        max_tokens: max_tokens || 4096,
      }),
    });
    
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error('Chat API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Image API - proxy to Zhipu
app.post('/api/image', async (req, res) => {
  const { apiKey, model, prompt, size, n } = req.body;
  
  try {
    const resp = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'cogview-3-flash',
        prompt,
        size: size || '1024x1024',
        n: n || 1,
      }),
    });
    
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error('Image API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Liquor Content Generator running on port ${PORT}`);
});
