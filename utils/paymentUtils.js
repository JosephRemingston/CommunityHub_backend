import dotenv from "dotenv";
import Stripe from "stripe";
import { makeLog } from "./logentries.js";

// Load environment variables
dotenv.config();

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Process a payment for a campaign pledge
 * @param {Object} paymentData - Payment data including amount, token, user info
 * @param {String} campaignId - ID of the campaign being pledged to
 * @returns {Object} Payment result with transaction ID
 */
export const processPayment = async (paymentData, campaignId) => {
  try {
    const { amount, token, description, metadata } = paymentData;
    
    // Create a charge using Stripe
    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency: "usd", // Use environment variable for currency in production
      source: token,
      description: description || `Pledge for campaign ${campaignId}`,
      metadata: {
        campaignId,
        ...metadata
      }
    });
    
    await makeLog(`Payment processed: ${charge.id} for campaign ${campaignId}, amount: ${amount}`, 
      "PaymentEvent", process.env.paymentLogs);
    
    return {
      success: true,
      transactionId: charge.id,
      amount: amount,
      fee: charge.fee ? charge.fee / 100 : 0,
      created: charge.created
    };
    
  } catch (error) {
    await makeLog(`Payment failed: ${error.message} for campaign ${campaignId}`, 
      "PaymentError", process.env.paymentLogs);
    
    throw new Error(`Payment processing failed: ${error.message}`);
  }
};

/**
 * Process a refund for a campaign pledge
 * @param {Object} backer - Backer object from campaign
 * @param {String} campaignId - ID of the campaign
 * @returns {Object} Refund result with refund ID
 */
export const processCampaignRefund = async (backer, campaignId) => {
  try {
    // In a real implementation, you'd store the Stripe charge ID in the backer object
    // For this example, we'll use a placeholder method to find the charge
    const chargeId = backer.transactionId || await findChargeIdForBacker(backer, campaignId);
    
    if (!chargeId) {
      throw new Error("No transaction found for this pledge");
    }
    
    // Process the refund through Stripe
    const refund = await stripe.refunds.create({
      charge: chargeId,
      reason: 'requested_by_customer'
    });
    
    await makeLog(`Refund processed: ${refund.id} for charge ${chargeId}, campaign ${campaignId}`, 
      "RefundEvent", process.env.paymentLogs);
    
    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };
    
  } catch (error) {
    await makeLog(`Refund failed: ${error.message} for campaign ${campaignId}`, 
      "RefundError", process.env.paymentLogs);
    
    throw new Error(`Refund processing failed: ${error.message}`);
  }
};

/**
 * Find a charge ID for a backer (placeholder implementation)
 * In a real implementation, you would store the transaction ID with the backer
 */
async function findChargeIdForBacker(backer, campaignId) {
  // This is a placeholder. In a real implementation, you would:
  // 1. Check if the backer object has the transaction ID stored
  // 2. Or query your payment records table to find the appropriate transaction
  
  // For now, return a fake ID if in development mode
  if (process.env.NODE_ENV === 'development') {
    return `ch_fake_${backer.user}_${Date.now()}`;
  }
  
  // Otherwise throw an error
  throw new Error("Transaction ID not found for this pledge");
}