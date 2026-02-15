const axios = require('axios');

/**
 * Process payment through PayStation gateway
 * @param {Object} paymentData - Payment information
 * @returns {Object} Response from PayStation
 */
async function processPayment(paymentData) {
  try {
    const response = await axios.post('https://sandbox.paystation.com.bd/initiate-payment', {
      invoice_number: paymentData.invoice_number,
      currency: paymentData.currency || 'BDT',
      payment_amount: paymentData.amount,
      cust_name: paymentData.customer.name,
      cust_phone: paymentData.customer.phone,
      cust_email: paymentData.customer.email,
      cust_address: paymentData.customer.address,
      reference: paymentData.reference || 'Shopify-App',
      callback_url: paymentData.callback_url,
      checkout_items: paymentData.checkout_items || 'items',
      pay_with_charge: paymentData.pay_with_charge || '1',
      emi: paymentData.emi || '0',
      merchantId: paymentData.merchantId,
      password: paymentData.password
    });

    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
}

/**
 * Verify transaction status with PayStation
 * @param {string} invoiceNumber - Invoice number to verify
 * @param {string} merchantId - Merchant ID for authentication
 * @returns {Object} Transaction status
 */
async function verifyTransaction(invoiceNumber, merchantId) {
  try {
    const response = await axios.post('https://sandbox.paystation.com.bd/transaction-status', {
      invoice_number: invoiceNumber
    }, {
      headers: {
        'merchantId': merchantId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw new Error(`Transaction verification failed: ${error.message}`);
  }
}

/**
 * Generate invoice number
 * @param {string} orderId - Shopify order ID
 * @returns {string} Generated invoice number
 */
function generateInvoiceNumber(orderId) {
  const currentDatetime = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/g, '').substring(0, 14);
  return `SH${currentDatetime}-${orderId}`;
}

/**
 * Validate payment amount for EMI
 * @param {number} amount - Payment amount
 * @param {boolean} emiEnabled - Whether EMI is enabled
 * @returns {Object} Validation result
 */
function validateEMIAmount(amount, emiEnabled) {
  if (emiEnabled && amount < 5000) {
    return {
      valid: false,
      message: 'Minimum amount should be 5000 BDT for EMI.'
    };
  }
  
  return {
    valid: true,
    message: null
  };
}

module.exports = {
  processPayment,
  verifyTransaction,
  generateInvoiceNumber,
  validateEMIAmount
};