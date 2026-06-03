import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin', 'blacklisted'], // ✅ Synced with admin dashboard access controls
    default: 'user' // 'user' = Explorer, 'owner' = Business Owner, 'admin' = System Admin
  },
  
  // =========================================================================
  // ✅ VIRTUAL WALLET & AFFILIATE REFERRAL ECOSYSTEM LOGIC PROPERTIES
  // =========================================================================
  referralCode: {
    type: String,
    unique: true,
    trim: true,
    // Automatically generates an isolated 6-character clean alpha-numeric string uppercase code upon record creation
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase()
  },
  referredBy: {
    type: String, // Stores the unique referralCode of the affiliate who invited this profile
    default: null,
    trim: true
  },
  walletBalance: {
    type: Number,
    default: 0 // Active withdrawable cash balance (increments by ₦40 per successful check-out)
  },
  walletTotalEarned: {
    type: Number,
    default: 0 // Historical lifetime commission earnings metric tracker
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Production indexing for blazing-fast database lookup operations
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ referralCode: 1 }); // ✅ HIGH PERFORMANCE INDEXING: Accelerates signup promotional validation routines
userSchema.index({ referredBy: 1 });   // ✅ HIGH PERFORMANCE INDEXING: Speeds up aggregations and commission distribution sweeps

const User = mongoose.model('User', userSchema);
export default User;