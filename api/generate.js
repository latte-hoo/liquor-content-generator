// Vercel Serverless Function - API Proxy for ZhiPu AI
// Handles both text generation (glm-4-flash) and image generation (cogview-3-flash)

const ZHIPU_BASE = 'https://open.bigmodel.cn/api/paas/v4';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { type, apiKey, model, messages, temperature, max_tokens, prompt, size, n } = req.body;

    if (!apiKey) {
      res.status(400).json({ error: '缺少 API Key' });
      return;
    }

    let apiUrl;
    let requestBody;

    if (type === 'text') {
      // Text generation: forward to chat completions
      apiUrl = `${ZHIPU_BASE}/chat/completions`;
      requestBody = {
        model: model || 'glm-4-flash',
        messages: messages,
        temperature: temperature || 0.8,
        max_tokens: max_tokens || 4096,
      };
    } else if (type === 'image') {
      // Image generation: forward to images API
      apiUrl = `${ZHIPU_BASE}/images/generations`;
      requestBody = {
        model: model || 'cogview-3-flash',
        prompt: prompt,
        size: size || '1024x1024',
        n: n || 1,
      };
    } else {
      res.status(400).json({ error: 'Unknown type: ' + type });
      return;
    }

    // Call ZhiPu API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Return ZhiPu response as-is
    res.status(response.status).json(data);

  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
