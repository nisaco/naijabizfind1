import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Filter, ChevronRight, Menu, X, Camera, 
  Phone, MessageCircle, Scissors, Coffee, ShoppingBag, Settings, 
  PlusCircle, Globe, CheckCircle2, ArrowRight, Clock, Heart, 
  Share2, Navigation, ArrowLeft, ShieldCheck, Zap, FileText, Upload
} from 'lucide-react';

// --- Theme & Configuration ---
const COLORS = {
  primary: '#008751', 
  primaryDark: '#007043',
  accent: '#FFC107',  
  textMain: '#111827',
  textMuted: '#6B7280',
};

// --- Mock Data Generator ---
const generateBusinesses = (count, offset = 0) => {
  const categories = ["Fashion", "Food", "Services", "Beauty", "Auto"];
  const cities = ["Lagos", "Abuja", "PH City", "Ibadan", "Kano"];
  const images = [
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600",
    "https://images.unsplash.com/photo-1486006396113-ad3397b31293?q=80&w=600",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=600",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600"
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: offset + i,
    name: ["Standard Shop", "Kola's Garage", "Elite Styles", "Mama's Pot", "Fix-It Hub"][i % 5] + ` #${offset + i}`,
    category: categories[i % categories.length],
    location: cities[i % cities.length],
    rating: (4.0 + Math.random()).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 20,
    featured: i < 5 && offset === 0,
    price: `₦${(Math.random() * 5 + 2).toFixed(0)},000+`,
    image: images[i % images.length],
    description: "Providing high-quality local services to the community with years of experience and verified customer satisfaction. We take pride in our work and ensure every customer leaves happy.",
    phone: "+234 800 000 0000",
    whatsapp: "+234 800 000 0000",
    hours: "9:00 AM - 6:00 PM",
    address: `No. ${i + 1} Business Road, ${cities[i % cities.length]}`
  }));
};

const FEATURED_SECTION = generateBusinesses(10, 0);
const POPULAR_SECTION = generateBusinesses(10, 10);
const ALL_BUSINESSES = [...FEATURED_SECTION, ...POPULAR_SECTION];

const CATEGORIES = [
  { name: "Fashion", icon: <ShoppingBag size={18} /> },
  { name: "Food", icon: <Coffee size={18} /> },
  { name: "Services", icon: <Settings size={18} /> },
  { name: "Beauty", icon: <Scissors size={18} /> },
  { name: "Tech", icon: <Globe size={18} /> }
];

// --- Sub-Components: Individual Business Cards ---

const BusinessCard = ({ biz, onClick }) => (
  <div 
    onClick={() => onClick(biz)}
    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
  >
    <div className="relative h-40 sm:h-44 overflow-hidden">
      <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      {biz.featured && (
        <div className="absolute top-3 left-3 bg-[#008751] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
          Featured
        </div>
      )}
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate">{biz.name}</h3>
      <div className="flex items-center text-gray-500 text-[10px] sm:text-xs mb-3">
        <MapPin size={12} className="mr-1 text-[#008751]" /> {biz.location}
      </div>
      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star size={14} fill={COLORS.accent} stroke={COLORS.accent} />
          <span className="text-xs sm:text-sm font-bold text-gray-900">{biz.rating}</span>
        </div>
        <span className="text-[#008751] font-bold text-[10px] sm:text-xs">{biz.price}</span>
      </div>
    </div>
  </div>
);

// --- Page Views ---

const HomeView = ({ onNavigate, onSelectBusiness }) => (
  <div className="animate-in fade-in duration-500">
    <div className="bg-[#008751] py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-white">
        <div className="text-center md:text-left md:w-3/5">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">
            Find Local Experts <br className="hidden md:block"/> In Your Community
          </h1>
          <p className="text-emerald-50 text-xs md:text-base mb-6 opacity-90 font-medium max-w-lg mx-auto md:mx-0">
            Connecting you with verified tailors, mechanics, salons, and vendors in Nigeria. Quick, reliable, and professional.
          </p>
          <div className="flex bg-white rounded-xl p-1 shadow-lg max-w-md mx-auto md:mx-0 overflow-hidden">
            <input 
              type="text" 
              placeholder="e.g. Tailor in Lagos" 
              className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button 
              onClick={() => onNavigate('directory')}
              className="bg-[#008751] text-white px-4 md:px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-800 transition-all"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>

{/*Horizontal Category List*/}
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {CATEGORIES.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => onNavigate('directory')}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full hover:border-[#008751] hover:text-[#008751] transition-all font-semibold text-[11px] md:text-sm text-gray-600 shadow-sm"
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
    </section>
 
 {/*Grid" Featured Businesses*/}
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Featured Business</h2>
          <p className="text-[10px] md:text-xs text-gray-400">Hand-picked premium listings</p>
        </div>
        <button onClick={() => onNavigate('directory')} className="text-[#008751] text-xs md:text-sm font-bold flex items-center gap-1 hover:underline">
          View All <ArrowRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {FEATURED_SECTION.map(biz => <BusinessCard key={biz.id} biz={biz} onClick={onSelectBusiness} />)}
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-emerald-900">List your local business today</h3>
          <p className="text-emerald-700 text-xs md:text-sm font-medium">Join over 1,000+ businesses getting discovered daily.</p>
        </div>
        <button onClick={() => onNavigate('submit')} className="w-full md:w-auto bg-[#008751] text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-all text-sm shadow-lg">
          Get Started
        </button>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Popular Nearby</h2>
        <p className="text-[10px] md:text-xs text-gray-400">What's trending in your area</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {POPULAR_SECTION.map(biz => <BusinessCard key={biz.id} biz={biz} onClick={onSelectBusiness} />)}
      </div>
    </section>
  </div>
);

// --- VIEW: BUSINESS DETAIL PROFILE ---
const DetailView = ({ business, onBack }) => (
  <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 animate-in fade-in slide-in-from-right-4 duration-500">
    <button onClick={onBack} className="flex items-center gap-2 text-gray-400 font-bold mb-6 hover:text-[#008751] transition-colors text-xs md:text-sm">
      <ArrowLeft size={16} /> Back to Search
    </button>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
      <div className="lg:col-span-7 space-y-6 md:space-y-8">
        <div className="rounded-2xl md:rounded-3xl overflow-hidden h-64 md:h-96 shadow-lg border border-gray-100">
          <img src={business.image} className="w-full h-full object-cover" alt={business.name} />
        </div>
        <div>
          <div className="flex items-center gap-2 text-[#008751] font-bold text-[10px] uppercase tracking-widest mb-2">
            <CheckCircle2 size={14} /> Verified Business
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3">{business.name}</h1>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">{business.description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
           <div className="flex gap-3">
              <MapPin className="text-[#008751] flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900 text-xs md:text-sm">Location</p>
                <p className="text-gray-500 text-xs md:text-sm">{business.address}</p>
              </div>
           </div>
           <div className="flex gap-3">
              <Clock className="text-[#008751] flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-900 text-xs md:text-sm">Operating Hours</p>
                <p className="text-gray-500 text-xs md:text-sm">{business.hours}</p>
              </div>
           </div>
        </div>
      </div>

{/*Contact Info SideBar*/}
      <div className="lg:col-span-5">
        <div className="sticky top-24 bg-white p-6 md:p-8 border border-gray-100 rounded-2xl md:rounded-3xl shadow-xl space-y-4">
          <h3 className="font-extrabold text-gray-900 text-base md:text-lg">Contact Professional</h3>
          <button className="w-full py-4 bg-[#008751] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all text-sm shadow-md">
            <Phone size={18} /> Call {business.phone}
          </button>
          <button className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm shadow-md">
            <MessageCircle size={18} /> Chat on WhatsApp
          </button>
          <div className="text-center pt-2">
            <p className="text-[9px] md:text-[10px] text-gray-400 font-medium">Please mention <span className="text-[#008751] font-bold">NaijaBizFind</span> when calling.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);


// --- VIEW: MULTI-STEP SUBMISSION FORM ---
const SubmitView = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('basic');

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-6 md:p-12 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Register Your Business</h2>
            <p className="text-xs md:text-sm text-gray-500 font-semibold mt-1">Step {step} of 3</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-6 md:w-10 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#008751]' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>
        
        {/* STEP 1: BUSINESS DATA COLLECTION */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
              <input type="text" className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#008751] font-bold text-sm" placeholder="e.g. Kola's Repairs" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <select className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#008751] font-bold text-sm">
                  {CATEGORIES.map(c => <option key={c.name} value={c.name.toLowerCase()}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City Location</label>
                <input type="text" className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#008751] font-bold text-sm" placeholder="Lagos, Abuja, etc." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Time of Work (Operating Hours)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                   <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input type="text" className="w-full p-3 md:p-4 pl-10 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#008751] font-bold text-xs md:text-sm" placeholder="Opening (e.g. 6am)" />
                </div>
                <div className="relative">
                   <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input type="text" className="w-full p-3 md:p-4 pl-10 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#008751] font-bold text-xs md:text-sm" placeholder="Closing (e.g. 8pm)" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
              <textarea rows="3" className="w-full p-3 md:p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#008751] font-bold text-sm resize-none" placeholder="Describe your services briefly..."></textarea>
            </div>
            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 md:py-5 bg-[#008751] text-white rounded-xl md:rounded-2xl font-extrabold text-base md:text-lg hover:bg-emerald-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Next: Media Upload <ChevronRight size={20} />
            </button>
          </div>
        )}


 {/* STEP 2: CLOUDINARY MEDIA UPLOAD SECTION */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between ml-1">
                  Shop Picture (Required)
                  <span className="text-[9px] text-[#008751] lowercase font-black">Display photo</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-[#008751] hover:text-[#008751] transition-all cursor-pointer group">
                  <Camera size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-600">Click to upload shop cover</span>
                  <p className="text-[10px] mt-1 opacity-60">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between ml-1">
                  Business Certificate (Optional)
                  <span className="text-[9px] text-gray-300 lowercase font-medium">For verified badge</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 bg-gray-50/30 rounded-2xl p-6 flex items-center gap-4 text-gray-400 hover:border-[#008751] hover:text-[#008751] transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                    <FileText size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold block text-gray-600">Upload CAC or Trade Cert</span>
                    <p className="text-[9px] opacity-60">PDF, PNG or JPG</p>
                  </div>
                  <Upload size={18} className="text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm">Back</button>
              <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-[#008751] text-white rounded-xl font-extrabold text-sm shadow-lg">Next: Select Plan</button>
            </div>
          </div>
        )}

{/* STEP 3: PAYSTACK PLAN SELECTION */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setSelectedPlan('basic')}
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'basic' ? 'border-[#008751] bg-emerald-50 shadow-inner' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={20} className={selectedPlan === 'basic' ? 'text-[#008751]' : 'text-gray-300'} />
                  <span className="font-black text-gray-900 text-sm uppercase tracking-tight">Basic Listing</span>
                </div>
                <div className="text-2xl font-black text-gray-900 mb-4">₦5,000</div>
                <ul className="text-[10px] text-gray-500 space-y-2 font-medium">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Standard Search Position</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Contact Call/WhatsApp Buttons</li>
                </ul>
              </div>

              <div 
                onClick={() => setSelectedPlan('featured')}
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'featured' ? 'border-[#FFC107] bg-amber-50 shadow-inner' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <div className="absolute -top-3 right-4 bg-[#FFC107] text-emerald-900 text-[9px] font-black px-2 py-1 rounded-md shadow-sm">RECOMMENDED</div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={20} className={selectedPlan === 'featured' ? 'text-[#FFC107]' : 'text-gray-300'} />
                  <span className="font-black text-gray-900 text-sm uppercase tracking-tight">Featured</span>
                </div>
                <div className="text-2xl font-black text-gray-900 mb-4">₦10,000</div>
                <ul className="text-[10px] text-gray-500 space-y-2 font-medium">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Show on Homepage Top</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Priority Search Spotlight</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <button onClick={() => setStep(2)} className="w-full md:w-1/3 py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm">Back</button>
              <button 
                onClick={() => alert(`Redirecting to payment gateway for ${selectedPlan === 'basic' ? '₦5,000' : '₦10,000'}`)} 
                className="w-full md:w-2/3 py-4 bg-[#008751] text-white rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all"
              >
                Pay & List Business
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = (p) => { 
    setPage(p); 
    setSelectedBiz(null); 
    setIsMenuOpen(false); 
    window.scrollTo(0, 0); 
  };

  const handleSelectBusiness = (biz) => { 
    setSelectedBiz(biz); 
    setPage('detail'); 
    window.scrollTo(0, 0); 
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 py-3 md:py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div onClick={() => navigate('home')} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#008751] rounded-lg flex items-center justify-center text-white font-black italic text-lg shadow-inner group-hover:rotate-6 transition-transform">N</div>
            <span className="text-base md:text-lg font-black tracking-tighter text-[#008751]">NaijaBizFind</span>
          </div>

          <div className="hidden md:flex gap-8">
            <button onClick={() => navigate('home')} className={`text-[11px] uppercase font-black transition-colors ${page === 'home' ? 'text-[#008751]' : 'text-gray-400 hover:text-gray-600'}`}>Home</button>
            <button onClick={() => navigate('directory')} className={`text-[11px] uppercase font-black transition-colors ${page === 'directory' ? 'text-[#008751]' : 'text-gray-400 hover:text-gray-600'}`}>Directory</button>
            <button onClick={() => navigate('submit')} className="bg-[#008751] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-800 shadow-md">List Business</button>
          </div>

          <button className="md:hidden p-2 text-gray-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

 {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-2xl md:hidden animate-in slide-in-from-top-4">
            <button onClick={() => navigate('home')} className="text-left font-black text-[11px] uppercase tracking-widest text-gray-600 py-2 border-b border-gray-50">Home</button>
            <button onClick={() => navigate('directory')} className="text-left font-black text-[11px] uppercase tracking-widest text-gray-600 py-2 border-b border-gray-50">Browse Directory</button>
            <button onClick={() => navigate('submit')} className="w-full bg-[#008751] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs mt-2 shadow-lg">List My Business</button>
          </div>
        )}
      </nav>


 {/* VIEW SWITCHER LOGIC */}
      <main>
        {page === 'home' && <HomeView onNavigate={navigate} onSelectBusiness={handleSelectBusiness} />}
        {page === 'detail' && <DetailView business={selectedBiz} onBack={() => navigate('home')} />}
        {page === 'submit' && <SubmitView />}
        {page === 'directory' && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900">Explore Directory</h1>
                  <p className="text-xs md:text-sm text-gray-400 font-medium">Discover over 1,200 local service providers across Nigeria</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-black uppercase tracking-widest text-gray-600 shadow-sm flex items-center justify-center gap-2"><Filter size={14} /> Filter</button>
                   <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-black uppercase tracking-widest text-gray-600 shadow-sm flex items-center justify-center gap-2"><MapPin size={14} /> All Cities</button>
                </div>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                {ALL_BUSINESSES.map(biz => <BusinessCard key={biz.id} biz={biz} onClick={handleSelectBusiness} />)}
             </div>
          </div>
        )}
      </main>

 {/* FOOTER SECTION */}
      <footer className="bg-white border-t border-gray-100 pt-12 md:pt-16 pb-8 px-4 md:px-6 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#008751] rounded flex items-center justify-center text-white font-black italic text-xs">N</div>
                <span className="text-sm font-black text-[#008751]">NaijaBizFind</span>
              </div>
              <p className="text-gray-400 text-[11px] md:text-xs leading-relaxed max-w-xs font-medium">Connecting local artisans and small businesses with customers in every Nigerian neighborhood. Built for Nigerians, by Nigerians.</p>
           </div>
           <div>
              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Company</h4>
              <ul className="text-xs md:text-sm text-gray-500 space-y-3 font-bold uppercase tracking-tight">
                 <li className="hover:text-[#008751] cursor-pointer text-[11px]">About Us</li>
                 <li className="hover:text-[#008751] cursor-pointer text-[11px]">Privacy Policy</li>
                 <li className="hover:text-[#008751] cursor-pointer text-[11px]">Terms</li>
              </ul>
           </div>
           <div>
              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Resources</h4>
              <ul className="text-xs md:text-sm text-gray-500 space-y-3 font-bold uppercase tracking-tight">
                 <li className="hover:text-[#008751] cursor-pointer text-[11px]">Submit Listing</li>
                 <li className="hover:text-[#008751] cursor-pointer text-[11px]">Partner Portal</li>
                 <li className="hover:text-[#008751] cursor-pointer text-[11px]">Support</li>
              </ul>
           </div>
           <div>
              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Connect</h4>
              <div className="flex gap-3">
                 {[1,2,3].map(i => <div key={i} className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#008751] hover:text-white transition-all cursor-pointer"><Globe size={18} /></div>)}
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
           <p className="text-[9px] md:text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">© 2026 NaijaBizFind. Supporting Small Business Growth.</p>
           <div className="flex gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase text-gray-300">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Platform Active</span>
              <span className="hidden sm:inline">Lagos • Abuja • Port Harcourt</span>
           </div>
        </div>
      </footer>
    </div>
  );
}