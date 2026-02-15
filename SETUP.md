# PayStation Payment Gateway for Shopify - Setup Guide

This guide will walk you through setting up the PayStation Payment Gateway app for your Shopify store.

## Prerequisites

- Shopify Partner account (https://partners.shopify.com/)
- PayStation merchant account with API credentials
- Node.js (v14 or higher) and npm installed
- A publicly accessible server or hosting service (required for callbacks)

## Step 1: Get Your PayStation Credentials

1. Log in to your PayStation merchant dashboard
2. Navigate to API settings
3. Note down your Merchant ID and API Password
4. Set up your callback/failure URLs as needed

## Step 2: Create a Shopify App in Your Partner Dashboard

1. Go to your Shopify Partners dashboard
2. Click "Create App"
3. Select "Custom app" 
4. Name your app "PayStation Payment Gateway"
5. Note down the API Key and API Secret Key

## Step 3: Set Up the App Server

### Option A: Local Development (using ngrok)

1. Clone/download this repository
2. Navigate to the shopify-app directory:
   ```bash
   cd pgw-wp-plugin-main/shopify-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your credentials:
   ```
   SHOPIFY_API_KEY=your_actual_api_key
   SHOPIFY_API_SECRET=your_actual_api_secret
   HOST=your-ngrok-url.ngrok.io  # Get this from ngrok after running it
   SCOPES=read_products,write_products,read_orders,write_orders,read_payments,write_payments
   
   # PayStation Configuration
   PAYSTATION_MERCHANT_ID=your_paystation_merchant_id
   PAYSTATION_PASSWORD=your_paystation_password
   PAYSTATION_FAIL_URL=https://your-shop.myshopify.com/cart
   ```

6. Start ngrok to expose your local server:
   ```bash
   npx ngrok http 3000
   ```

7. Copy the forwarding URL (e.g., https://abcd-1234-efgh.ngrok.io) and update your HOST in `.env`

8. Start the app:
   ```bash
   npm start
   ```

### Option B: Production Deployment

1. Push the code to your hosting provider (Heroku, Vercel, AWS, etc.)
2. Set environment variables according to your hosting platform's instructions
3. Ensure your domain is accessible over HTTPS

## Step 4: Register the App in Your Partner Dashboard

1. In your Shopify Partner dashboard, go to your app
2. Under "App setup", add the following:
   - App URL: `https://your-app-domain.ngrok.io` (or your production domain)
   - Allowed redirection URLs: `https://your-app-domain.ngrok.io/auth/callback`

## Step 5: Install the App on Your Store

1. In your Partner dashboard, scroll down to "Test your app"
2. Select your development store
3. Click "Install app"
4. You'll be redirected to authenticate the app on your store

## Step 6: Configure PayStation Settings

1. Once installed, you'll see the PayStation app in your Shopify admin
2. Click on the app to access settings
3. Enter your PayStation credentials:
   - Merchant ID
   - API Password
   - Select charge option (customer pays vs merchant pays)
   - Enable/disable EMI (note: minimum 5000 BDT for EMI)
   - Fail/Cancel URL (defaults to cart page)
4. Click "Save Settings"

## Step 7: Enable the Payment Method

1. In your Shopify admin, go to Settings > Payments
2. Look for "PayStation" in the "Additional payment methods" section
3. Enable the PayStation payment method
4. Configure any additional settings as needed

## Testing the Integration

1. Add items to your cart in your Shopify store
2. Proceed to checkout
3. Select PayStation as your payment method
4. You should be redirected to PayStation's payment page
5. Complete a test payment using test credentials if available

## Troubleshooting

### Common Issues:

1. **App won't load in Shopify admin:**
   - Verify your HOST in `.env` is accessible via HTTPS
   - Check that your redirect URLs match exactly
   - Ensure all scopes are properly configured

2. **Payment fails to initiate:**
   - Confirm PayStation credentials are correct
   - Verify your callback URL is accessible
   - Check server logs for error messages

3. **Callback not received:**
   - Ensure your server is accessible from the internet
   - Check that PayStation can reach your callback URL
   - Verify firewall settings aren't blocking requests

### Checking Logs:

During development, check your server console for log messages:
- Payment initiation requests
- Callback requests from PayStation
- Error messages

## Security Considerations

- Never commit your `.env` file to version control
- Use strong passwords for your PayStation account
- Ensure all connections use HTTPS
- Regularly rotate your API credentials

## Updating the App

To update the app:

1. Pull the latest code changes
2. Install any new dependencies: `npm install`
3. Restart your server
4. Test all functionality after updates

## Support

If you encounter issues with the setup:

1. Check the server logs for error messages
2. Verify all configuration settings
3. Ensure your PayStation account is properly set up
4. Contact PayStation support for API-related issues
5. Consult Shopify's developer documentation for platform-specific questions

---

**Note:** This app requires a live PayStation merchant account to function properly. Test credentials can be used for development purposes.