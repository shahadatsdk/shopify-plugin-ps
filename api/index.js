const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Simple middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serverless function is working' });
});

// Main route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PayStation Shopify App API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Test route to verify deployment
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    env_vars: {
      SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? 'SET' : 'NOT_SET',
      HOST: process.env.HOST || 'NOT_SET'
    }
  });
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);