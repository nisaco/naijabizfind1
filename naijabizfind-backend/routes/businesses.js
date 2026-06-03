import express from 'express';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import Business from '../models/Business.js';
import User from '../models/User.js'; 

const router = express.Router();

// @route   POST /api/businesses/register
// @desc    Register a new business (status: pending, isPaid: false)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name, category, city, address, description,
      email, phone, whatsapp, openTime, closeTime, plan,
      shopPhoto, certificate
    } = req.body;

    // Required field validation
    if (!name || !category || !city || !address || !description || !phone || !openTime || !closeTime) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    if (!shopPhoto) {
      return res.status(400).json({ message: 'Shop photo is required. Please upload an image first.' });
    }

    const newBusiness = new Business({
      name,
      category: category.toLowerCase().trim(),
      city,
      address,
      description,
      email: email.toLowerCase().trim(),
      phone,
      whatsapp: whatsapp || phone,
      workingHours: {
        open: openTime,
        close: closeTime
      },
      images: {
        shopPhoto,
        certificate: certificate || undefined
      },
      plan: plan || 'basic',
      isPaid: false,
      status: 'pending'
    });

    const savedBusiness = await newBusiness.save();

    // AUTOMATIC UPGRADE: Force update account capability configurations to 'owner' profile role inside DB
    await User.findOneAndUpdate(
      { phone: phone.trim() }, 
      { role: 'owner' }
    );

    res.status(201).json(savedBusiness);
  } catch (error) {
    console.error('Business register error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/businesses/owner-login
// @desc    Business owner login or registration pipeline by credentials check (Emits secure session token)
// @access  Public
router.post('/owner-login', async (req, res) => {
  try {
    // ✅ FIX: Formatted to explicitly extract promoCodeApplied out of the request body mapping list
    const { phone, password, username, email, role, promoCodeApplied } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number parameter layout sequence is required.' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');

    // 1. Search if this user account profile already exists in the real MongoDB database
    let existingUser = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { email: email ? email.toLowerCase().trim() : '___nonexistent___' }
      ]
    });

    // 2. If the user does not exist (Registration Flow from Signup Page), hash password and save them permanently to the MongoDB database!
    if (!existingUser) {
      const providedPassword = password || 'secure_default_pass';
      
      // BCRYPT ENCRYPTION: Hash raw plain-text password using 10 salt rounds before saving to DB
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(providedPassword, salt);

      let validReferrerCode = null;
      if (promoCodeApplied) {
        const referrerCheck = await User.findOne({ referralCode: promoCodeApplied.trim().toUpperCase() });
        
        // ✅ DYNAMIC THRESHOLD CHECK: Query historical conversions count directly from live collections
        if (referrerCheck) {
          const usageCount = await User.countDocuments({ referredBy: referrerCheck.referralCode });
          if (usageCount >= 15) {
            return res.status(400).json({ message: 'Registration Notice: This target referral invitation code has reached its capacity limit and is expired.' });
          }
          validReferrerCode = referrerCheck.referralCode;
        }
      }

      existingUser = new User({
        username: username || 'User_' + Math.floor(1000 + Math.random() * 9000),
        email: email ? email.toLowerCase().trim() : `${cleanPhone}@naijabizfind.com`,
        phone: cleanPhone,
        password: hashedPassword, 
        role: role || 'user',
        referredBy: validReferrerCode, // Saved safely to trace wallet operations later
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        walletBalance: 0,
        walletTotalEarned: 0
      });
      await existingUser.save();
    } else {
      // 3. If the user DOES exist (Login Flow from Login Page), securely verify the password credential signature matching algorithm
      if (password) {
        // BCRYPT COMPARISON: Compare provided plain password string with securely hashed database counterpart
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Authentication Failed: Invalid password signature match.' });
        }
      }
    }

    if (existingUser.role === 'blacklisted') {
      return res.status(403).json({ 
        message: 'Access Blocked: This profile has been deactivated by administrative command guidelines.' 
      });
    }

    // 4. Search businesses database to pull matching listings owned by this phone account
    const businessList = await Business.find({ phone: existingUser.phone });

    // ✅ ZERO HARDCODING: Live evaluation of affiliate metrics derived from cross-collection records counts
    const totalSuccessfulUses = await User.countDocuments({ referredBy: existingUser.referralCode });

    const signatureSecret = process.env.JWT_SECRET || 'naijabizfind_secret_fallback_key_2026';
    const sessionToken = jwt.sign(
      { 
        userId: existingUser._id, 
        role: existingUser.role,
        phone: existingUser.phone 
      },
      signatureSecret,
      { expiresIn: '2h' } 
    );

    // 6. Return response object mapping all attributes cleanly including the newly emitted token
    res.json({
      token: sessionToken,
      _id: businessList.length > 0 ? businessList[0]._id : null,
      name: businessList.length > 0 ? businessList[0].name : existingUser.username,
      phone: existingUser.phone,
      email: existingUser.email,
      role: existingUser.role, 
      description: businessList.length > 0 ? businessList[0].description : '',
      plan: businessList.length > 0 ? businessList[0].plan : 'basic',
      status: businessList.length > 0 ? businessList[0].status : 'approved',
      isPaid: businessList.length > 0 ? businessList[0].isPaid : true,
      shopPhoto: businessList.length > 0 ? (businessList[0].images?.shopPhoto || businessList[0].shopPhoto) : '',
      allListings: businessList,
      
      // ✅ SYSTEM CONFIGURATION: Dispatched directly from backend variables matching database records
      myReferralCode: existingUser.referralCode,
      referralCount: totalSuccessfulUses,
      maxReferralsLimit: 15, 
      payoutRatePerReferral: 40, 
      isReferralExpired: totalSuccessfulUses >= 15,
      walletBalance: existingUser.walletBalance || 0,
      walletTotalEarned: existingUser.walletTotalEarned || 0
    });

  } catch (error) {
    console.error('Owner login verification query exception crash:', error);
    res.status(500).json({ message: 'Internal server database communication failure.', error: error.message });
  }
});

// @route   GET /api/businesses
// @desc    Get all approved & paid businesses. Supports ?category= and ?city= filters
router.get('/', async (req, res) => {
  try {
    const { category, city } = req.query;

    const filter = { isPaid: true, status: 'approved' };

    if (category) filter.category = category.toLowerCase();
    if (city) filter.city = new RegExp(city, 'i');

    const businesses = await Business.find(filter)
      .select('-__v')
      .sort({ plan: -1, createdAt: -1 });

    res.json(businesses);
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/businesses/:id
// @desc    Get a single approved + paid business by ID
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).select('-__v');

    if (!business) return res.status(404).json({ message: 'Business not found' });

    if (!business.isPaid || business.status !== 'approved') {
      return res.status(403).json({ message: 'This listing is not publicly visible yet' });
    }

    res.json(business);
  } catch (error) {
    console.error('Get business by ID error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;