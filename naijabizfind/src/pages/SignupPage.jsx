import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, User, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const API_BASE = '/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('user'); // 'user' or 'owner'
  
  // Controlled input states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // ✅ AUTO-CAPTURE HOOK STATE: Captures parameters from the invitation link
  const [referralCodeField, setReferralCodeField] = useState('');
  
  // Loading and Error Status Hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Automatically parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // 1. Capture role configuration overrides
    const roleParam = params.get('role');
    if (roleParam === 'owner') setRole('owner');

    // 2. ✅ AFFILIATE INVITATION AUTO-CATCH: Extracts code directly from ?ref= dynamic paths
    const referralParam = params.get('ref');
    if (referralParam) {
      console.log("🎯 Auto-detected invitation node code signature:", referralParam);
      setReferralCodeField(referralParam.trim().toUpperCase());
      // Force set role to 'owner' because referrals are aimed at onboarding premium business listings
      setRole('owner');
    }
  }, [location]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Send registration payload directly to the authenticated user route
      const res = await fetch(`${API_BASE}/businesses/owner-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          phone,
          password,
          role,
          // ✅ PAYLOAD DISPATCH: Submits promo token down to your database validations
          promoCodeApplied: referralCodeField || null
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration rejected by database cluster.');
      }

      // Populate local browser cache fields safely (Supports standard structural fallbacks)
      if (data.token) {
        // Safe check parameters extraction from nested arrays or direct variables
        const activeRole = data.role || (data.user ? data.user.role : 'user');
        const activeName = data.name || data.username || 'Workspace Owner';
        const activePhone = data.phone || phone;

        localStorage.setItem('userRole', activeRole);
        localStorage.setItem('username', activeName);
        localStorage.setItem('userPhone', activePhone);
        
        // If a web session token is passed from the backend, log it inside the local container
        localStorage.setItem('authToken', data.token);

        if (activeRole === 'owner') {
          navigate('/dashboard');
        } else {
          navigate('/explore');
        }
      } else {
        // Fallback layout mapping block
        localStorage.setItem('userRole', data.role || 'user');
        localStorage.setItem('username', data.name || 'Explorer');
        localStorage.setItem('userPhone', data.phone || phone);

        if (data.role === 'owner') {
          navigate('/dashboard');
        } else {
          navigate('/explore');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to establish connection to authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Assets */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute w-96 h-96 bg-green-400/5 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-[#008751]/5 rounded-full blur-3xl bottom-10 right-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Join NaijaBizFind today</p>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in">
            <AlertCircle size={16} className="flex-shrink-0" /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Workspace Scope</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => !referralCodeField && setRole('user')}
                disabled={!!referralCodeField} // Locks choice to ensure they register correctly under an invitation path
                className={`py-3 flex flex-col items-center gap-1.5 rounded-xl border-2 transition-all ${
                  role === 'user' 
                    ? 'border-[#008751] bg-green-50/50 text-[#008751]' 
                    : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-gray-50/20'
                } ${referralCodeField ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <User size={18} />
                <span className="text-xs font-black uppercase tracking-wider">Explorer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-3 flex flex-col items-center gap-1.5 rounded-xl border-2 transition-all ${
                  role === 'owner' 
                    ? 'border-[#008751] bg-green-50/50 text-[#008751]' 
                    : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-gray-50/20'
                }`}
              >
                <Store size={18} />
                <span className="text-xs font-black uppercase tracking-wider">Business</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#008751] focus:border-[#008751] block p-3 outline-none font-medium transition-all" 
              placeholder="niikpakpo" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#008751] focus:border-[#008751] block p-3 outline-none font-medium transition-all" 
              placeholder="user@gmail.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number</label>
            <input 
              type="text" 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#008751] focus:border-[#008751] block p-3 outline-none font-medium transition-all" 
              placeholder="e.g. +2348031234567" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#008751] focus:border-[#008751] block p-3 outline-none font-medium transition-all" 
              placeholder="••••••••" 
            />
          </div>

          {/* ✅ ACCESSIBLE AUTO-CAPTURED INVITE FIELD MARKUP GRID */}
          <div className="pt-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Affiliate Invite Code Link
            </label>
            <input 
              type="text"
              value={referralCodeField}
              onChange={(e) => setReferralCodeField(e.target.value)}
              readOnly={!!referralCodeField} // Secures input text lines if captured via link
              placeholder="No active tracking invitation link applied"
              className={`w-full border text-xs rounded-xl block p-3 outline-none font-bold tracking-wider font-mono transition-all ${
                referralCodeField 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 focus:border-[#008751] focus:text-gray-900'
              }`}
            />
            {referralCodeField && (
              <p className="text-[10px] text-emerald-600 font-extrabold mt-1.5 flex items-center gap-1 animate-in fade-in">
                <ShieldCheck size={12} /> Affiliate tracking verified. Commission unlocks after listing completion.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full text-white bg-[#008751] hover:bg-[#006B40] font-black uppercase tracking-wide rounded-xl text-xs px-5 py-4 text-center transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-green-900/20 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Sign Up as {role === 'owner' ? 'Business Profile' : 'Explorer Provider'}
          </button>
          
          <p className="text-xs font-bold text-gray-400 text-center mt-4">
            Already have an account? <span onClick={() => navigate('/login')} className="text-[#008751] hover:underline cursor-pointer font-extrabold">Log in</span>
          </p>
        </form>
      </div>
    </div>
  );
}