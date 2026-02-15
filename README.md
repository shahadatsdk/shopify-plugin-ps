# PayStation Payment Gateway for Shopify

This Shopify app integrates the PayStation payment gateway with your Shopify store, allowing customers to pay securely via Credit/Debit card, Internet banking, or Mobile banking.

## Features

- Secure payment processing through PayStation
- Support for both charged and non-charged transactions
- EMI (Easy Monthly Installment) option
- Real-time transaction status verification
- Automatic order status updates
- Easy configuration through Shopify admin

## Prerequisites

- Shopify Partner account
- PayStation merchant account with API credentials
- Node.js environment (v14 or higher)
- Publicly accessible server or hosting service

## Installation & Setup

Detailed setup instructions are available in the [SETUP.md](SETUP.md) file. The setup process includes:

1. Getting your PayStation credentials
2. Creating a Shopify app in your Partner Dashboard
3. Setting up the app server (locally with ngrok or in production)
4. Installing and configuring the app on your Shopify store
5. Enabling the payment method in Shopify

## Configuration

1. Enter your Shopify API credentials in the `.env` file
2. Add your PayStation merchant ID and password
3. Configure the fail/cancel URL as needed
4. Set up the required scopes for the app
5. Access the app in your Shopify admin to configure settings

## Usage

1. Once installed, go to the app settings in your Shopify admin
2. Enter your PayStation credentials
3. Configure payment options (charge/no charge, EMI)
4. Save the settings
5. The PayStation payment method will be available at checkout

## API Endpoints

- `/process-payment` - Initiates payment with PayStation
- `/handle-callback` - Handles PayStation response
- `/payment-provider` - Registers payment method with Shopify
- `/save-settings` - Saves configuration settings

## Support

For support, please refer to the troubleshooting section in [SETUP.md](SETUP.md) or contact PayStation support for API-related issues.

## Note

This app requires a live PayStation merchant account to function properly. Test credentials can be used for development purposes.

## Security

- Never commit your `.env` file to version control
- Ensure all connections use HTTPS
- Regularly review and update your API credentials