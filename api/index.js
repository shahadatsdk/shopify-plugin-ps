// Vercel Serverless Function for PayStation Shopify App
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Parse the request
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;
    
    console.log(`Processing ${method} request to ${path}`);

    // Route handling
    if (path === '/' || path === '/api') {
      res.status(200).json({
        message: 'PayStation Shopify App API',
        status: 'Running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
      return;
    }

    if (path === '/health') {
      res.status(200).json({
        status: 'OK',
        message: 'Serverless function is working',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (path === '/test') {
      res.status(200).json({
        message: 'Test endpoint working',
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'development',
          SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? 'SET' : 'NOT_SET',
          HOST: process.env.HOST || 'NOT_SET'
        },
        headers: req.headers
      });
      return;
    }

    // Shopify webhook endpoint
    if (path === '/webhooks/orders/create' && method === 'POST') {
      const shop = req.headers['x-shopify-shop-domain'];
      console.log('Received webhook from shop:', shop);
      
      res.status(200).send('OK');
      return;
    }

    // Default 404 for unknown routes
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${path} not found`,
      available_routes: ['/', '/health', '/test', '/webhooks/orders/create']
    });

  } catch (error) {
    console.error('Serverless function error:', error);
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};