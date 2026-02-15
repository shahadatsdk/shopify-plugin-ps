require('dotenv').config();
const express = require('express');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const { shopifyApp, BillingInterval } = require('@shopify/shopify-app-express');
const { restResources } = require("@shopify/admin-api-client");
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize Shopify app
const sAppInstance = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_products', 'write_products', 'read_orders', 'write_orders', 'read_payments', 'write_payments'],
  hostName: process.env.HOST,
  hostScheme: process.env.HOST_SCHEME || 'http',
  apiVersion: '2023-04',
  isEmbeddedApp: true,
  billing: {
    required: false,
  },
});

const app = express();

// Set up middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Add basic CORS and security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Home route
app.get('/', async (req, res, next) => {
  const shop = req.query.shop || 'test-shop.myshopify.com';
  res.redirect(`/app?shop=${shop}`);
});

// Auth routes
// Mock auth routes for local testing
app.get('/auth', async (req, res, next) => {
  const shop = req.query.shop;
  res.redirect(`/auth/callback?shop=${shop}&host=test-host`);
});

app.get('/auth/callback', async (req, res, next) => {
  res.redirect(`/`);
});

// App route
app.get('/app', async (req, res, next) => {
  const shop = req.query.shop || req.query.domain;
  
  // Read the template file and replace placeholders
  let template = fs.readFileSync(path.join(__dirname, 'templates', 'index.html'), 'utf8');
  template = template.replace('{{ api_key }}', process.env.SHOPIFY_API_KEY || '');
  template = template.replace('{{ shop.permanent_domain }}', shop || '');
  template = template.replace('{{ shop.domain }}', (shop || '').replace('.myshopify.com', ''));

  res.send(template);
});

// Endpoint to save settings
app.post('/save-settings', async (req, res) => {
  try {
    // Extract session information from the Shopify session
    const session = res.locals.session || req.body.session;
    const shop = session?.shop || req.body.shop || req.headers['x-shopify-shop-domain'];
    
    if (!shop) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    // In a real implementation, you would save these settings to your database
    // For now, we'll just return success
    console.log('Saving settings for shop:', shop, req.body);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoint for order creation
app.post('/webhooks/orders/create', async (req, res) => {
  // Verify webhook using Shopify's verification
  const shop = req.headers['x-shopify-shop-domain'];
  const hmac = req.headers['x-shopify-hmac-sha256'];

  if (!shop || !hmac) {
    return res.status(401).send('Unauthorized');
  }

  console.log('Received order webhook for shop:', shop, req.body);
  res.status(200).send('OK');
});

// Payment processing endpoint
app.post('/process-payment', async (req, res) => {
  try {
    const { shop, cart, orderId, amount, currency } = req.body;
    const session = res.locals.session;
    
    if (!shop || !session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real implementation, you would retrieve stored settings from your database
    // For now, using defaults
    const settings = { 
      merchant_id: process.env.DEFAULT_MERCHANT_ID || 'test-merchant', 
      password: process.env.DEFAULT_PASSWORD || 'test-password', 
      charge_for_customer: '1', 
      emi: '0' 
    };
    
    if (!settings) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Import the payment processing module
    const { processPayment, generateInvoiceNumber, validateEMIAmount } = require('./paystation-process');
    
    // Validate EMI amount if EMI is enabled
    const emiEnabled = settings.emi === '1';
    const validation = validateEMIAmount(amount, emiEnabled);
    
    if (!validation.valid) {
      return res.status(400).json({
        result: 'error',
        message: validation.message
      });
    }
    
    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(orderId);
    
    // Prepare customer data
    const customer = {
      name: cart.customer?.firstName || 'Guest',
      phone: cart.customer?.phone || '',
      email: cart.customer?.email || '',
      address: cart.shippingAddress?.address1 || ''
    };
    
    // Prepare payment data
    const paymentData = {
      invoice_number: invoiceNumber,
      currency: currency || 'BDT',
      amount: amount,
      customer: customer,
      reference: 'Shopify-App',
      callback_url: `${process.env.HOST}/handle-callback?shop=${shop}`,
      checkout_items: 'items',
      pay_with_charge: settings.charge_for_customer || '1',
      emi: settings.emi || '0',
      merchantId: settings.merchant_id,
      password: settings.password
    };

    // Process payment with PayStation
    const responseData = await processPayment(paymentData);
    
    if (responseData.status === 'success') {
      res.json({
        result: 'success',
        redirectUrl: responseData.payment_url,
        invoiceNumber: invoiceNumber
      });
    } else {
      res.status(400).json({
        result: 'error',
        message: responseData.message || 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      result: 'error',
      message: error.message
    });
  }
});

// Callback handler for PayStation responses
app.get('/handle-callback', async (req, res) => {
  try {
    const { status, invoice_number, trx_id, shop } = req.query;
    
    if (!status || !invoice_number) {
      return res.status(400).send('Invalid request');
    }

    // Extract order ID from invoice number (format: SHXXXXXXXXXXXXX-ORDERID)
    const orderId = invoice_number.split('-').pop();
    
    // Verify transaction status with PayStation
    const { verifyTransaction } = require('./paystation-process');
    const verifyResponse = await verifyTransaction(invoice_number, '104-1653730183');

    // Process the response based on transaction status
    if (verifyResponse.status_code === '200' && verifyResponse.data.trx_status === 'successful') {
      // In a real implementation, you would update the Shopify order status here
      console.log(`Payment successful for order ${orderId}. Transaction ID: ${trx_id}`);
      
      // Redirect to success page
      res.redirect(`http://${shop}/checkout?status=success&order=${orderId}`);
    } else {
      // Handle failed/cancelled payment
      const failUrl = process.env.PAYSTATION_FAIL_URL || `http://${shop}/cart`;
      res.redirect(failUrl);
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    res.status(500).send('Error processing callback');
  }
});

// Payment provider registration endpoint (Shopify uses this to register payment methods)
app.post('/payment-provider', async (req, res) => {
  // This endpoint would be used by Shopify to register the payment method
  res.json({
    name: 'PayStation',
    handle: 'paystation',
    type: 'offsite',
    callbackUrl: `/process-payment`,
    configurable: true
  });
});

// Start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Use a tunnel service like localtunnel to access externally: npx localtunnel --port ${PORT}`);
  });
}

module.exports = app;