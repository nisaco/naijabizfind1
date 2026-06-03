import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import Business from '../models/Business.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js'; // ✅ Registered User Schema for Affiliate Wallet calculations

const router = express.Router();

// Pricing map (in Naira, converted to Kobo for Paystack)
const PLAN_PRICES = {
  basic: 5000,
  featured: 10000,
  ultimate: 25000 // Added ultimate tier pricing map configuration to support checkout buttons
};

// HELPER LAYER: Self-contained logic to securely distribute affiliate funds
const processReferralBonusPayout = async (phone) => {
  try {
    // 1. Trace the user profile document that owns this storefront
    const businessOwner = await User.findOne({ phone });
    if (!businessOwner || !businessOwner.referredBy) return;

    // 2. Look up the original affiliate referrer account profile code
    const referrerAccount = await User.findOne({ referralCode: businessOwner.referredBy });
    if (!referrerAccount) return;

    // 3. Check current transaction instance counts to protect the absolute ceiling bounds
    const currentUsageCount = await User.countDocuments({ referredBy: referrerAccount.referralCode });

    // ✅ 15 USERS HARD CEILING CAP: Only award the 40 Naira incentive if total uses stay under the threshold
    if (currentUsageCount <= 15) {
      // Safely apply credits onto virtual tracking balances
      referrerAccount.walletBalance = (referrerAccount.walletBalance || 0) + 40;
      referrerAccount.walletTotalEarned = (referrerAccount.walletTotalEarned || 0) + 40;
      await referrerAccount.save();
      console.log(`[REFERRAL SYSTEM] Dispatched ₦40 to Referrer Code [${referrerAccount.referralCode}] for conversion number ${currentUsageCount}`);
    } else {
      console.log(`[REFERRAL OVERFLOW] Code [${referrerAccount.referralCode}] has exceeded the 15 uses ceiling threshold. Payout omitted.`);
    }
  } catch (err) {
    console.error('Affiliate referral calculation exception error:', err.message);
  }
};

// @route   POST /api/payments/initialize
// @desc    Initialize a Paystack transaction for a business listing fee
// @access  Public
router.post('/initialize', async (req, res) => {
  try {
    const { businessId, email } = req.body;

    if (!businessId || !email) {
      return res.status(400).json({ message: 'businessId and email are required' });
    }

    // Find the business to get its plan
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business entry not found' });
    }

    if (business.isPaid) {
      return res.status(400).json({ message: 'This business has already been paid for' });
    }

    // Convert Naira to Kobo (Paystack standard)
    const planPrice = PLAN_PRICES[business.plan] || PLAN_PRICES.basic;
    const amountInKobo = planPrice * 100;

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const paymentData = {
      email,
      amount: amountInKobo,
      metadata: {
        businessId: business._id.toString(),
        businessName: business.name,
        plan: business.plan
      },
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paymentData,
      config
    );

    // Returns: { authorization_url, access_code, reference }
    res.json(response.data.data);
  } catch (error) {
    console.error('Paystack initialize error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Paystack initialization failed', error: error.message });
  }
});

// @route   GET /api/payments/verify/:reference
// @desc    Verify a Paystack transaction and update business isPaid status
// @access  Public (called after redirect from Paystack)
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Check if this reference was already processed (idempotency guard)
    const existing = await Transaction.findOne({ reference });
    if (existing && existing.status === 'success') {
      return res.json({ message: 'Payment already verified successfully', success: true });
    }

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    // Verify with Paystack servers
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      config
    );

    const { status, amount, metadata } = response.data.data;

    if (status === 'success') {
      const businessId = metadata.businessId;

      // Update business to paid state context
      const targetedBusiness = await Business.findByIdAndUpdate(businessId, { isPaid: true }, { new: true });

      // Log the transaction (upsert to avoid duplicates)
      await Transaction.findOneAndUpdate(
        { reference },
        {
          businessId,
          reference,
          amount: amount / 100, // Store in Naira
          status: 'success',
          paidAt: new Date()
        },
        { upsert: true, new: true }
      );

      // ✅ REWARD INCENTIVE VERIFICATION: Fire the wallet credit system check cleanly if valid owner profiles exist
      if (targetedBusiness && targetedBusiness.phone) {
        await processReferralBonusPayout(targetedBusiness.phone);
      }

      return res.json({
        message: 'Payment verified successfully. Awaiting admin approval.',
        success: true,
        businessId
      });
    } else {
      // Log failed transaction
      await Transaction.findOneAndUpdate(
        { reference },
        { reference, amount: 0, status: 'failed' },
        { upsert: true }
      );

      return res.status(400).json({ message: 'Transaction was not successful', success: false });
    }
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Paystack webhook events for payment consistency
// @access  Paystack servers only (verified via HMAC signature)
router.post('/webhook', async (req, res) => {
  try {
    // Safely parse standard webhook event fields without reading from a broken raw stream interface
    const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
    
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      const businessId = metadata?.businessId;

      if (!businessId) {
        console.warn('Webhook: Missing businessId in metadata for reference:', reference);
        return res.sendStatus(200); 
      }

      const existing = await Transaction.findOne({ reference, status: 'success' });
      if (!existing) {
        const targetedBusiness = await Business.findByIdAndUpdate(businessId, { isPaid: true }, { new: true });

        await Transaction.findOneAndUpdate(
          { reference },
          {
            businessId,
            reference,
            amount: amount / 100,
            status: 'success',
            paidAt: new Date()
          },
          { upsert: true, new: true }
        );

        // ✅ REWARD INCENTIVE WEBHOOK: Double check and run referral verification inside backup background streams
        if (targetedBusiness && targetedBusiness.phone) {
          await processReferralBonusPayout(targetedBusiness.phone);
        }

        console.log(`✅ Webhook: Payment confirmed and referral evaluated for business ${businessId}`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    res.sendStatus(200);
  }
});

export default router;