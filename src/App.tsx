/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshDistortMaterial, ContactShadows, PointerLockControls, Html, Stage } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  LandPlot, 
  CircleDollarSign, 
  Calendar, 
  Home, 
  Palette, 
  Settings2,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  History,
  X,
  Trash2,
  FileText,
  Loader2,
  Search,
  Download,
  Sparkles,
  User as UserIcon,
  Mail,
  Phone,
  Layers,
  LayoutGrid,
  PlusCircle,
  LogIn,
  LogOut,
  Menu,
  Box,
  Maximize2,
  Heart,
  Users,
  TrendingUp,
  Columns,
  Zap,
  Armchair,
  Image as ImageIcon,
  Camera,
  Sun,
  Save,
  Eye,
  Ruler,
  Moon,
  Cloud,
  RotateCcw
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';
import { 
  Step, 
  PropertyBrief, 
  Message, 
  OwnershipStatus, 
  BudgetRange, 
  Timeline, 
  PropertyType, 
  LifestylePriority,
  SavedBrief,
  SortOption,
  FloorPlan,
  Room,
  Milestone,
  NeighborhoodInsights
} from './types';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  onSnapshot, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  handleFirestoreError, 
  OperationType,
  User,
  testConnection
} from './firebase';
import { SaveDiscoveryButton } from './components/SaveProjectButton';
import { DiscoveryHistory } from './components/ProjectHistory';

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || 'missing-key' });
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        if (this.state.error && typeof this.state.error.message === 'string') {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error) {
            errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} at ${parsedError.path}`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || String(this.state.error) || errorMessage;
      }

      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2">Application Error</h2>
            <p className="text-stone-600 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface CuratedLink {
  url: string;
  category: string;
}

const DESIGN_STYLES = [
  { id: 'coastal', name: 'Coastal Traditional', description: 'Light, airy interiors with classic Southern charm and expansive porches.' },
  { id: 'farmhouse', name: 'Modern Farmhouse', description: 'Rustic elements meet clean lines, featuring vaulted ceilings and natural textures.' },
  { id: 'manor', name: 'European Manor', description: 'Timeless stone exteriors, grand entryways, and sophisticated formal spaces.' },
  { id: 'contemporary', name: 'Contemporary Glass', description: 'Floor-to-ceiling windows, open layouts, and seamless indoor-outdoor living.' },
  { id: 'estate', name: 'Custom Estate', description: 'Grand proportions, private amenities, and unparalleled attention to detail.' },
];

function NeighborhoodInsightsPanel({ 
  insights, 
  onClose 
}: { 
  insights: NeighborhoodInsights, 
  onClose: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-serif text-white">Neighborhood Intelligence</h3>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Local Market • Insights Report</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors group">
            <X className="w-6 h-6 text-white/40 group-hover:text-white" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Community */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-white font-serif text-xl">
                <LayoutGrid className="w-5 h-5 text-white/60" />
                {insights.community.title}
              </div>
              <ul className="space-y-4">
                {insights.community.details.map((detail, idx) => (
                  <li key={idx} className="flex gap-4 text-sm text-white/60 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lifestyle */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-white font-serif text-xl">
                <Sun className="w-5 h-5 text-white/60" />
                {insights.lifestyle.title}
              </div>
              <ul className="space-y-4">
                {insights.lifestyle.details.map((detail, idx) => (
                  <li key={idx} className="flex gap-4 text-sm text-white/60 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Market */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-white font-serif text-xl">
                <CircleDollarSign className="w-5 h-5 text-white/60" />
                {insights.market.title}
              </div>
              <ul className="space-y-4">
                {insights.market.details.map((detail, idx) => (
                  <li key={idx} className="flex gap-4 text-sm text-white/60 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Insights */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-8 flex items-center gap-3">
              <Sparkles className="w-4 h-4" />
              Strategic Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {insights.recommendations.map((recommendation, idx) => (
                <div key={idx} className="flex gap-6 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white group-hover:bg-white/20 transition-colors">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}



function ComparisonModal({ images, onClose }: { images: string[], onClose: () => void }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(pos, 0), 100));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <Columns className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-serif text-white">Concept Comparison</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Side-by-Side Property Analysis</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white/5 rounded-full transition-all group"
        >
          <X className="w-6 h-6 text-white/40 group-hover:text-white" />
        </button>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
        <div 
          ref={containerRef}
          className="relative w-full max-w-6xl aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 select-none cursor-col-resize shadow-2xl"
          onMouseMove={handleMove}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchMove={handleMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* Background Image (Right) */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={images[1]} 
              alt="Concept B" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <motion.div 
              className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Foreground Image (Left) */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white shadow-[10px_0_30px_rgba(0,0,0,0.5)]"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute inset-0 w-full h-full" style={{ width: `${100 / (sliderPos / 100)}%` }}>
              <img 
                src={images[0]} 
                alt="Concept A" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <motion.div 
                className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />
            </div>
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white z-10 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-black/20 rounded-full" />
                <div className="w-1 h-4 bg-black/20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-8 left-8 px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[10px] uppercase tracking-widest text-white/80 z-20">
            Concept A
          </div>
          <div className="absolute bottom-8 right-8 px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[10px] uppercase tracking-widest text-white/80 z-20">
            Concept B
          </div>
        </div>
      </div>

      <div className="p-8 flex justify-center border-t border-white/10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
          Drag the slider to compare property details and lifestyle variations
        </p>
      </div>
    </motion.div>
  );
}

interface SavedView {
  id: string;
  name: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  lightingIntensity: number;
  roughness?: number;
  metalness?: number;
  environmentPreset?: string;
  reflectivity?: number;
  textureScale?: number;
}

function FloorPlanViewer({ 
  plans, 
  activePlanIndex, 
  onSwitchPlan, 
  onGenerateVariation, 
  onUpdate, 
  onClose,
  isGenerating
}: { 
  plans: FloorPlan[], 
  activePlanIndex: number, 
  onSwitchPlan: (index: number) => void, 
  onGenerateVariation: () => void, 
  onUpdate: (feedback: string) => void, 
  onClose: () => void,
  isGenerating: boolean
}) {
  const [feedback, setFeedback] = useState('');
  const [is3D, setIs3D] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{ type: string, roomName: string, dimensions: string, material: string } | null>(null);
  const plan = plans[activePlanIndex];
  
  const getRoomColor = (type: string) => {
    switch (type) {
      case 'living': return 'fill-blue-500/20 stroke-blue-500';
      case 'bedroom': return 'fill-emerald-500/20 stroke-emerald-500';
      case 'kitchen': return 'fill-orange-500/20 stroke-orange-500';
      case 'bathroom': return 'fill-cyan-500/20 stroke-cyan-500';
      case 'garage': return 'fill-zinc-500/20 stroke-zinc-500';
      default: return 'fill-white/10 stroke-white/20';
    }
  };

  const getRoomColorHex = (type: string) => {
    switch (type) {
      case 'living': return '#3b82f6';
      case 'bedroom': return '#10b981';
      case 'kitchen': return '#f97316';
      case 'bathroom': return '#06b6d4';
      case 'garage': return '#71717a';
      default: return '#ffffff';
    }
  };

  if (!plan) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col"
    >
      <div className="flex items-center justify-between p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-serif text-white">Spatial Layout Generator</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{is3D ? 'Interactive 3D Model' : 'Preliminary 2D Property Layout'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIs3D(!is3D)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-[10px] uppercase tracking-widest transition-all border ${
              is3D 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
            }`}
          >
            {is3D ? <LayoutGrid className="w-4 h-4" /> : <Box className="w-4 h-4" />}
            {is3D ? 'Switch to 2D' : 'View in 3D'}
          </button>
          
          {is3D && (
            <button 
              onClick={() => setIsWireframe(!isWireframe)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-[10px] uppercase tracking-widest transition-all border ${
                isWireframe 
                  ? 'bg-white/20 text-white border-white/30' 
                  : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              {isWireframe ? 'Solid View' : 'Wireframe'}
            </button>
          )}
          <div className="w-px h-8 bg-white/10 mx-2" />
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-full transition-all group"
          >
            <X className="w-6 h-6 text-white/40 group-hover:text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        {/* Sidebar for details and adjustments */}
        <div className="w-96 border-r border-white/10 p-8 flex flex-col gap-8 bg-black/20 overflow-y-auto">
          {plans.length > 1 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Variations</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {plans.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSwitchPlan(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                      idx === activePlanIndex 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Option {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Property Overview</h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/60">Estimated Area</span>
                <span className="text-sm text-white font-medium">{plan.totalArea} sq ft</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed italic">"{plan.description}"</p>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Room Schedule</h4>
            <div className="space-y-3">
              {plan.rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getRoomColor(room.type).split(' ')[1].replace('stroke-', 'bg-')}`} />
                    <span className="text-xs text-white/80">{room.name}</span>
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">{room.width}x{room.height}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Refine Layout</h4>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {['Larger Kitchen', 'More Bedrooms', 'Open Concept', 'Add Garage', 'Master Suite'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setFeedback(prev => prev ? `${prev}, ${suggestion}` : suggestion)}
                      className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] text-white/60 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., Make the kitchen larger, move master bedroom to the north..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all resize-none h-24"
                />
                <button 
                  onClick={() => {
                    onUpdate(feedback);
                    setFeedback('');
                  }}
                  disabled={!feedback.trim() || isGenerating}
                  className="w-full py-4 bg-white text-black rounded-2xl font-medium text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'Updating...' : 'Update Property Layout'}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onGenerateVariation}
              disabled={isGenerating}
              className="w-full py-4 bg-white/10 text-white border border-white/10 rounded-2xl font-medium text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Variation'}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-zinc-900/50 flex items-center justify-center p-12 relative">
          {isGenerating && (
            <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-xs text-white/60 uppercase tracking-widest">Generating Property Layout...</p>
              </div>
            </div>
          )}
          <div className="relative w-full h-full max-w-4xl max-h-[600px] bg-zinc-950 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }} />
            
            {is3D ? (
              <div className="w-full h-full relative">
                <Canvas shadows camera={{ position: [15, 15, 15], fov: 45 }}>
                  <color attach="background" args={['#09090b']} />
                  <Suspense fallback={null}>
                    <Stage adjustCamera={false} environment="city" intensity={0.5} shadows={{ type: 'contact', opacity: 0.4, blur: 2 }}>
                      <FloorPlan3D 
                        plan={plan} 
                        getRoomColorHex={getRoomColorHex} 
                        isWireframe={isWireframe}
                        onSelectElement={setSelectedElement}
                      />
                    </Stage>
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={50} />
                  </Suspense>
                </Canvas>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <span className="text-[10px] text-white/60 uppercase tracking-widest">Orbit to Explore</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <span className="text-[10px] text-white/60 uppercase tracking-widest">Scroll to Zoom</span>
                  </div>
                </div>
              </div>
            ) : (
              <svg 
                viewBox="0 0 800 600" 
                className="w-full h-full relative z-10"
                preserveAspectRatio="xMidYMid meet"
              >
                {plan.rooms.map((room) => (
                  <g key={room.id}>
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      className={`${getRoomColor(room.type)} stroke-2 transition-all duration-500`}
                      rx="4"
                    />
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white/80 text-[10px] uppercase tracking-widest font-medium pointer-events-none"
                    >
                      {room.name}
                    </text>
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2 + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white/30 text-[8px] uppercase tracking-widest pointer-events-none"
                    >
                      {room.width}' x {room.height}'
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedElement && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-8 top-32 w-80 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 z-30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-serif text-white">Element Details</h4>
              <button 
                onClick={() => setSelectedElement(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Type</label>
                <p className="text-white font-medium">{selectedElement.type}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Room / Area</label>
                <p className="text-white font-medium">{selectedElement.roomName}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Dimensions</label>
                <p className="text-white font-medium">{selectedElement.dimensions}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Material</label>
                <p className="text-white font-medium">{selectedElement.material}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FloorPlan3D({ 
  plan, 
  getRoomColorHex, 
  isWireframe, 
  onSelectElement 
}: { 
  plan: FloorPlan, 
  getRoomColorHex: (type: string) => string,
  isWireframe: boolean,
  onSelectElement: (info: { type: string, roomName: string, dimensions: string, material: string }) => void
}) {
  const wallHeight = 2.5;
  const wallThickness = 0.15;
  const scale = 0.05; // Scale from 800x600 to 40x30

  // Center the plan
  const offsetX = -400 * scale;
  const offsetY = -300 * scale;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Floor Base */}
      <mesh receiveShadow position={[0, 0, -0.05]}>
        <planeGeometry args={[800 * scale + 2, 600 * scale + 2]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} wireframe={isWireframe} />
      </mesh>

      {plan.rooms.map((room) => {
        const x = (room.x + room.width / 2) * scale + offsetX;
        const y = (room.y + room.height / 2) * scale + offsetY;
        const w = room.width * scale;
        const h = room.height * scale;

        const handleSelect = (type: string) => {
          onSelectElement({
            type,
            roomName: room.name,
            dimensions: `${room.width}' x ${room.height}'`,
            material: type === 'Floor' ? `${room.type.charAt(0).toUpperCase() + room.type.slice(1)} Finish` : 'Standard Partition'
          });
        };

        return (
          <group key={room.id}>
            {/* Room Floor */}
            <mesh 
              receiveShadow 
              position={[x, y, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('Floor');
              }}
            >
              <planeGeometry args={[w - 0.1, h - 0.1]} />
              <meshStandardMaterial 
                color={getRoomColorHex(room.type)} 
                transparent 
                opacity={0.3} 
                roughness={0.5}
                wireframe={isWireframe}
              />
            </mesh>

            {/* Room Walls */}
            {[
              { pos: [x, y + h / 2, wallHeight / 2], args: [w + wallThickness, wallThickness, wallHeight] },
              { pos: [x, y - h / 2, wallHeight / 2], args: [w + wallThickness, wallThickness, wallHeight] },
              { pos: [x + w / 2, y, wallHeight / 2], args: [wallThickness, h + wallThickness, wallHeight] },
              { pos: [x - w / 2, y, wallHeight / 2], args: [wallThickness, h + wallThickness, wallHeight] }
            ].map((wall, idx) => (
              <mesh 
                key={idx} 
                castShadow 
                position={wall.pos as [number, number, number]}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('Wall');
                }}
              >
                <boxGeometry args={wall.args as [number, number, number]} />
                <meshStandardMaterial color="#3f3f46" roughness={0.4} wireframe={isWireframe} />
              </mesh>
            ))}

            {/* Room Label */}
            <Html position={[x, y, wallHeight + 0.5]} center distanceFactor={15}>
              <div className="bg-black/80 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-lg text-[8px] uppercase tracking-widest font-bold whitespace-nowrap border border-white/10 pointer-events-none shadow-2xl">
                {room.name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}


function FlyPlayer() {
  const { camera } = useThree();
  const [isLocked, setIsLocked] = useState(false);
  const movement = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': movement.current.forward = true; break;
        case 'KeyA': movement.current.left = true; break;
        case 'KeyS': movement.current.backward = true; break;
        case 'KeyD': movement.current.right = true; break;
        case 'Space': movement.current.up = true; break;
        case 'ShiftLeft': movement.current.down = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': movement.current.forward = false; break;
        case 'KeyA': movement.current.left = false; break;
        case 'KeyS': movement.current.backward = false; break;
        case 'KeyD': movement.current.right = false; break;
        case 'Space': movement.current.up = false; break;
        case 'ShiftLeft': movement.current.down = false; break;
      }
    };

    const handleBlur = () => {
      movement.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
      };
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useFrame((_, delta) => {
    if (!isLocked) return;

    const speed = 5 * Math.min(delta, 0.1);
    const m = movement.current;
    
    if (m.forward) camera.translateZ(-speed);
    if (m.backward) camera.translateZ(speed);
    if (m.left) camera.translateX(-speed);
    if (m.right) camera.translateX(speed);
    if (m.up) camera.position.y += speed;
    if (m.down) camera.position.y -= speed;

    // Limit camera position to prevent disappearing
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -25, 25);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, -25, 25);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -25, 25);
  });

  return (
    <PointerLockControls 
      onLock={() => setIsLocked(true)} 
      onUnlock={() => setIsLocked(false)} 
    />
  );
}

function BuyingTimeline({ milestones }: { milestones: Milestone[] }) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="py-8">
      <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-8 flex items-center gap-3">
        <Calendar className="w-3 h-3" />
        Buying Roadmap & Milestones
      </h4>
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-white/10" />
        
        <div className="space-y-12">
          {milestones.map((milestone, idx) => (
            <motion.div 
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-12"
            >
              {/* Dot */}
              <div className={`absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] z-10 ${
                milestone.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' :
                milestone.status === 'current' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' :
                'bg-white/20'
              }`} />
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    milestone.status === 'completed' ? 'text-emerald-500' :
                    milestone.status === 'current' ? 'text-white' :
                    'text-white/40'
                  }`}>
                    {milestone.date}
                  </span>
                  {milestone.status === 'current' && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[8px] uppercase tracking-tighter text-white/60 border border-white/10">
                      In Progress
                    </span>
                  )}
                </div>
                <h5 className="text-white font-serif text-lg">{milestone.title}</h5>
                <p className="text-xs text-white/40 leading-relaxed max-w-xl">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tooltip({ children, text }: { children: React.ReactNode, text: string }) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[9px] uppercase tracking-widest text-white/80 whitespace-nowrap pointer-events-none z-50 shadow-2xl"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConceptToolbar({ 
  isMeasureMode, 
  setIsMeasureMode, 
  isFlyMode, 
  setIsFlyMode, 
  isWireframe,
  setIsWireframe,
  setShowSaveDialog,
  setMeasurePoints,
  hasMeasurePoints,
  environmentPreset,
  setEnvironmentPreset,
  reflectivity,
  setReflectivity,
  textureScale,
  setTextureScale,
  resetCamera
}: { 
  isMeasureMode: boolean, 
  setIsMeasureMode: (v: boolean) => void,
  isFlyMode: boolean,
  setIsFlyMode: (v: boolean) => void,
  isWireframe: boolean,
  setIsWireframe: (v: boolean) => void,
  setShowSaveDialog: (v: boolean) => void,
  setMeasurePoints: (v: THREE.Vector3[]) => void,
  hasMeasurePoints: boolean,
  environmentPreset: string,
  setEnvironmentPreset: (v: string) => void,
  reflectivity: number,
  setReflectivity: (v: number) => void,
  textureScale: number,
  setTextureScale: (v: number) => void,
  resetCamera: () => void
}) {
  const [showMaterialPanel, setShowMaterialPanel] = useState(false);

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-20">

      <Tooltip text="Reset Camera">
        <button 
          onClick={resetCamera}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </Tooltip>

      <div className="w-px h-3 bg-white/10 mx-0.5" />

      {isMeasureMode && hasMeasurePoints && (
        <Tooltip text="Clear Measurements">
          <button 
            onClick={() => setMeasurePoints([])}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      )}

      <div className="w-px h-3 bg-white/10 mx-0.5" />

      <Tooltip text="Toggle Fly Mode">
        <button 
          onClick={() => setIsFlyMode(!isFlyMode)}
          className={`p-2 rounded-lg transition-all ${
            isFlyMode ? 'bg-white text-black' : 'hover:bg-white/10 text-white/60 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </Tooltip>

      <div className="w-px h-3 bg-white/10 mx-0.5" />

      <Tooltip text="Toggle Wireframe">
        <button 
          onClick={() => setIsWireframe(!isWireframe)}
          className={`p-2 rounded-lg transition-all ${
            isWireframe ? 'bg-white text-black' : 'hover:bg-white/10 text-white/60 hover:text-white'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
        </button>
      </Tooltip>

      <div className="w-px h-3 bg-white/10 mx-0.5" />

      <div className="flex items-center gap-0.5">
        <Tooltip text="Daylight">
          <button 
            onClick={() => setEnvironmentPreset('city')}
            className={`p-2 rounded-lg transition-all ${
              environmentPreset === 'city' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <Tooltip text="Night">
          <button 
            onClick={() => setEnvironmentPreset('night')}
            className={`p-2 rounded-lg transition-all ${
              environmentPreset === 'night' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <Tooltip text="Overcast">
          <button 
            onClick={() => setEnvironmentPreset('studio')}
            className={`p-3 rounded-lg transition-all ${
              environmentPreset === 'studio' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-3 bg-white/10 mx-0.5" />

      <div className="relative">
        <Tooltip text="Adjust Features">
          <button 
            onClick={() => setShowMaterialPanel(!showMaterialPanel)}
            className={`p-2 rounded-lg transition-all ${
              showMaterialPanel ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <AnimatePresence>
          {showMaterialPanel && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] text-white/60 uppercase tracking-widest">
                  <span>Reflectivity</span>
                  <span>{Math.round(reflectivity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={reflectivity}
                  onChange={(e) => setReflectivity(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] text-white/60 uppercase tracking-widest">
                  <span>Texture Scale</span>
                  <span>{textureScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="5" 
                  step="0.1" 
                  value={textureScale}
                  onChange={(e) => setTextureScale(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-3 bg-white/10 mx-0.5" />

      <Tooltip text="Save Current View">
        <button 
          onClick={() => setShowSaveDialog(true)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}

function Concept3DViewer({ imageUrl, onClose, brief, showHistory, setShowHistory }: { imageUrl: string, onClose: () => void, brief: any, showHistory: boolean, setShowHistory: (v: boolean) => void }) {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [lightingIntensity, setLightingIntensity] = useState(0.5);
  const [roughness, setRoughness] = useState(0.2);
  const [metalness, setMetalness] = useState(0.1);
  const [environmentPreset, setEnvironmentPreset] = useState<string>('city');
  const [reflectivity, setReflectivity] = useState(0.5);
  const [textureScale, setTextureScale] = useState(1.0);
  const [viewName, setViewName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isFlyMode, setIsFlyMode] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isMeasureMode, setIsMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
  const [selectedElement, setSelectedElement] = useState<{ type: string, roomName: string, dimensions: string, material: string } | null>(null);
  const orbitControlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('avalon_concept_views');
    if (saved) {
      try {
        setSavedViews(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved views", e);
      }
    }
  }, []);

  const saveCurrentView = () => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    let targetX, targetY, targetZ;

    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      targetX = controls.target.x;
      targetY = controls.target.y;
      targetZ = controls.target.z;
    } else {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      targetX = camera.position.x + direction.x;
      targetY = camera.position.y + direction.y;
      targetZ = camera.position.z + direction.z;
    }

    const newView: SavedView = {
      id: Math.random().toString(36).substr(2, 9),
      name: viewName || `View ${savedViews.length + 1}`,
      cameraPosition: [camera.position.x, camera.position.y, camera.position.z],
      cameraTarget: [targetX, targetY, targetZ],
      lightingIntensity,
      roughness,
      metalness,
      environmentPreset,
      reflectivity,
      textureScale
    };

    const updated = [...savedViews, newView];
    setSavedViews(updated);
    try {
      localStorage.setItem('avalon_concept_views', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save views to localStorage:', e);
    }
    setViewName('');
    setShowSaveDialog(false);
  };

  const loadView = (view: SavedView) => {
    if (!cameraRef.current) return;

    const wasFlyMode = isFlyMode;
    if (isFlyMode) setIsFlyMode(false);

    const camera = cameraRef.current;
    
    const startTransition = () => {
      const controls = orbitControlsRef.current;
      
      gsap.to(camera.position, {
        x: view.cameraPosition[0],
        y: view.cameraPosition[1],
        z: view.cameraPosition[2],
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          if (controls) controls.update();
        }
      });

      if (controls) {
        gsap.to(controls.target, {
          x: view.cameraTarget[0],
          y: view.cameraTarget[1],
          z: view.cameraTarget[2],
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            controls.update();
          }
        });
      } else {
        camera.lookAt(...view.cameraTarget);
      }
    };

    if (wasFlyMode) {
      // Small delay to allow OrbitControls to mount
      setTimeout(startTransition, 50);
    } else {
      startTransition();
    }
    
    setLightingIntensity(view.lightingIntensity);
    if (view.roughness !== undefined) setRoughness(view.roughness);
    if (view.metalness !== undefined) setMetalness(view.metalness);
    if (view.environmentPreset !== undefined) setEnvironmentPreset(view.environmentPreset);
    if (view.reflectivity !== undefined) setReflectivity(view.reflectivity);
    if (view.textureScale !== undefined) setTextureScale(view.textureScale);
  };

  const deleteView = (id: string) => {
    const updated = savedViews.filter(v => v.id !== id);
    setSavedViews(updated);
    try {
      localStorage.setItem('avalon_concept_views', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save views to localStorage:', e);
    }
  };

  const resetCamera = () => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    
    setIsFlyMode(false);
    
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 8,
      duration: 1.5,
      ease: "power2.out"
    });

    if (orbitControlsRef.current) {
      gsap.to(orbitControlsRef.current.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => orbitControlsRef.current.update()
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col"
    >
      <div className="flex items-center justify-between p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-serif text-white">Immersive 3D Concept</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Interactive Property Visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-full transition-all group"
          >
            <X className="w-6 h-6 text-white/40 group-hover:text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex">
        {/* Left Sidebar for Saved Views & Controls */}
        <div className="w-80 border-r border-white/10 p-6 flex flex-col gap-8 bg-black/20">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
              <Sun className="w-3 h-3" />
              Lighting Environment
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-white/60 uppercase tracking-widest">
                <span>Intensity</span>
                <span>{Math.round(lightingIntensity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={lightingIntensity}
                onChange={(e) => setLightingIntensity(parseFloat(e.target.value))}
                className="w-full accent-white"
              />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
              <Box className="w-3 h-3" />
              Material Properties
            </h4>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] text-white/60 uppercase tracking-widest">
                  <span>Roughness</span>
                  <span>{Math.round(roughness * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] text-white/60 uppercase tracking-widest">
                  <span>Metalness</span>
                  <span>{Math.round(metalness * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Saved Perspectives
            </h4>
            {savedViews.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-white/20">No views saved yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedViews.map((view) => (
                  <div 
                    key={view.id}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => loadView(view)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white/40" />
                      </div>
                      <span className="text-xs text-white/80 font-medium">{view.name}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteView(view.id);
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <ConceptToolbar 
            isMeasureMode={isMeasureMode}
            setIsMeasureMode={setIsMeasureMode}
            isFlyMode={isFlyMode}
            setIsFlyMode={setIsFlyMode}
            isWireframe={isWireframe}
            setIsWireframe={setIsWireframe}
            setShowSaveDialog={setShowSaveDialog}
            setMeasurePoints={setMeasurePoints}
            hasMeasurePoints={measurePoints.length > 0}
            environmentPreset={environmentPreset}
            setEnvironmentPreset={setEnvironmentPreset}
            reflectivity={reflectivity}
            setReflectivity={setReflectivity}
            textureScale={textureScale}
            setTextureScale={setTextureScale}
            resetCamera={resetCamera}
          />
          <ErrorBoundary>
            <Canvas shadows gl={{ antialias: true }}>
              <color attach="background" args={['#050505']} />
              <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={50} />
            
            {isFlyMode ? (
              <FlyPlayer />
            ) : (
              <OrbitControls 
                ref={orbitControlsRef}
                enableDamping 
                dampingFactor={0.05} 
                minDistance={5} 
                maxDistance={20}
                autoRotate={savedViews.length === 0}
                autoRotateSpeed={0.5}
              />
            )}
            
            <ambientLight intensity={lightingIntensity} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={lightingIntensity * 2} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={lightingIntensity} />

            <Suspense fallback={
              <mesh>
                <boxGeometry args={[4, 2.25, 0.1]} />
                <meshStandardMaterial color="#333" wireframe />
              </mesh>
            }>
                <ConceptPanel 
                  url={imageUrl} 
                  roughness={roughness} 
                  metalness={metalness} 
                  reflectivity={reflectivity}
                  textureScale={textureScale}
                  isWireframe={isWireframe}
                  onSelectElement={setSelectedElement}
                />
  
              <ContactShadows 
                position={[0, -2, 0]} 
                opacity={0.4} 
                scale={10} 
                blur={2.5} 
                far={4} 
              />
              
              <Environment preset={environmentPreset as any} />
            </Suspense>
          </Canvas>
            <SaveDiscoveryButton brief={JSON.stringify(brief)} assets={[]} />
        <DiscoveryHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
      </ErrorBoundary>
  
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none">
            <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[10px] uppercase tracking-[0.3em] text-white/60">
              {isFlyMode 
                ? 'Click to lock mouse • WASD to move • Mouse to look' 
                : 'Click and drag to explore the property'}
            </div>
          </div>
        </div>
      </div>

      {/* Save View Dialog */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-8 top-32 w-80 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 z-30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-serif text-white">Element Details</h4>
              <button 
                onClick={() => setSelectedElement(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Type</label>
                <p className="text-white font-medium">{selectedElement.type}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Room / Area</label>
                <p className="text-white font-medium">{selectedElement.roomName}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Dimensions</label>
                <p className="text-white font-medium">{selectedElement.dimensions}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-2">Material</label>
                <p className="text-white font-medium">{selectedElement.material}</p>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/40 italic">
                  * Material properties can be adjusted using the toolbar sliders.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save View Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveDialog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <h4 className="text-xl font-serif text-white mb-2">Save Perspective</h4>
              <p className="text-xs text-white/40 mb-6 uppercase tracking-widest">Capture current camera and lighting settings</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">View Name</label>
                  <input 
                    type="text" 
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    placeholder="e.g., Master Bedroom, Backyard View..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/20"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white/60 hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveCurrentView}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white text-black font-medium hover:scale-105 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save View
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ConceptPanel({ 
  url, 
  roughness, 
  metalness,
  reflectivity,
  textureScale,
  isWireframe,
  onSelectElement
}: { 
  url: string, 
  roughness: number, 
  metalness: number,
  reflectivity: number,
  textureScale: number,
  isWireframe?: boolean,
  onSelectElement?: (info: { type: string, roomName: string, dimensions: string, material: string }) => void
}) {
  const texture = useLoader(THREE.TextureLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(textureScale, textureScale);
      texture.needsUpdate = true;
    }
  }, [texture, textureScale]);
  
  return (
    <group>
      {/* Main property panel */}
      <mesh 
        castShadow 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement?.({
            type: 'Property Panel',
            roomName: 'Main Property',
            dimensions: '4.0m x 2.25m',
            material: 'AI Generated Texture'
          });
        }}
      >
        <boxGeometry args={[4, 2.25, 0.1]} />
        <meshPhysicalMaterial 
          map={texture} 
          roughness={roughness} 
          metalness={metalness}
          reflectivity={reflectivity}
          envMapIntensity={reflectivity * 2}
          clearcoat={0.1}
          clearcoatRoughness={0.1}
          wireframe={isWireframe}
        />
      </mesh>
      
      {/* Decorative frame/backing */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[4.1, 2.35, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>

      {/* Ambient glowing element */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[4.5, 2.75]} />
        <MeshDistortMaterial 
          color="#ffffff" 
          opacity={0.05} 
          transparent 
          distort={0.4} 
          speed={2} 
        />
      </mesh>
    </group>
  );
}

const ParallaxImageInner = ({ 
  img, 
  idx, 
  scrollRef,
  selectedMoodBoardImages,
  toggleMoodBoardImage,
  compareImages,
  setCompareImages,
  setActive3DImage,
  isGeneratingVariation,
  handleGenerateVariation,
  setSelectedImageForRefinement
}: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  useLayoutEffect(() => {
    if (ref.current && scrollRef.current) {
      setIsReady(true);
    }
  }, []);
  const { scrollYProgress } = useScroll({
    target: isReady ? ref : undefined,
    container: isReady ? scrollRef : undefined,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group"
    >
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.img 
          src={img} 
          alt={`Concept ${idx + 1}`} 
          className="w-full h-[130%] object-cover relative -top-[15%]" 
          style={{ y }}
          referrerPolicy="no-referrer"
          whileHover={{ scale: 1.1, x: -10, y: -5 }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
        />
      </motion.div>
      
      {/* Subtle Bloom/Light Pulse */}
      <motion.div 
        className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: idx * 0.5
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-100 transition-opacity flex flex-col justify-end p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-bold drop-shadow-lg">Property Concept {idx + 1}</span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => toggleMoodBoardImage(img)}
              className={`p-2.5 rounded-xl border transition-all shadow-xl ${selectedMoodBoardImages.includes(img) ? 'bg-white text-black border-white' : 'bg-black/60 text-white border-white/20 hover:bg-white/20'}`}
              title={selectedMoodBoardImages.includes(img) ? "Remove from Mood Board" : "Add to Mood Board"}
            >
              <PlusCircle className={`w-4 h-4 transition-transform ${selectedMoodBoardImages.includes(img) ? 'rotate-45' : ''}`} />
            </button>
            <button 
              onClick={() => {
                if (compareImages.includes(img)) {
                  setCompareImages((prev: string[]) => prev.filter(i => i !== img));
                } else if (compareImages.length < 2) {
                  setCompareImages((prev: string[]) => [...prev, img]);
                }
              }}
              className={`p-2.5 rounded-xl border transition-all shadow-xl ${compareImages.includes(img) ? 'bg-white text-black border-white' : 'bg-black/60 text-white border-white/20 hover:bg-white/20'}`}
              title="Add to Comparison"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setActive3DImage(img)}
            className="flex flex-col items-center justify-center gap-1 py-2 bg-black/60 hover:bg-white/10 rounded-xl border border-white/10 backdrop-blur-md transition-all group/btn"
          >
            <Box className="w-4 h-4 text-white/60 group-hover/btn:text-white" />
            <span className="text-[8px] uppercase tracking-widest text-white/40 group-hover/btn:text-white">3D View</span>
          </button>
          <button 
            onClick={() => handleGenerateVariation(img)}
            disabled={isGeneratingVariation !== null}
            className="flex flex-col items-center justify-center gap-1 py-2 bg-black/60 hover:bg-white/10 rounded-xl border border-white/10 backdrop-blur-md transition-all group/btn disabled:opacity-50"
          >
            {isGeneratingVariation === img ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Layers className="w-4 h-4 text-white/60 group-hover/btn:text-white" />
            )}
            <span className="text-[8px] uppercase tracking-widest text-white/40 group-hover/btn:text-white">Variant</span>
          </button>
          <button 
            onClick={() => setSelectedImageForRefinement(img)}
            className="flex flex-col items-center justify-center gap-1 py-2 bg-white text-black hover:bg-white/90 rounded-xl border border-white/10 transition-all group/btn shadow-lg shadow-white/5"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[8px] uppercase tracking-widest font-bold">Refine</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ParallaxImage = (props: any) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (props.scrollRef.current) {
      setIsReady(true);
    }
  }, [props.scrollRef]);

  if (!isReady) {
    return (
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden group border border-white/10">
        <img 
          src={typeof props.img === 'string' ? props.img : props.img.url} 
          alt={typeof props.img === 'string' ? `Property Concept ${props.idx + 1}` : props.img.prompt} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return <ParallaxImageInner {...props} />;
};


const ParallaxMoodBoardImageInner = ({ img, i, scrollRef, setActive3DImage, setSelectedImageForRefinement }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  useLayoutEffect(() => {
    if (ref.current && scrollRef.current) {
      setIsReady(true);
    }
  }, []);
  const { scrollYProgress } = useScroll({
    target: isReady ? ref : undefined,
    container: isReady ? scrollRef : undefined,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative group">
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: i * 1 }}
      >
        <motion.img 
          src={img} 
          alt="Selected Concept" 
          className="w-full h-[120%] object-cover relative -top-[10%]" 
          style={{ y }}
          referrerPolicy="no-referrer"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 1.2 }}
        />
      </motion.div>
      
      {/* Bloom */}
      <motion.div 
        className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
      />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 gap-2">
        <button 
          onClick={() => setActive3DImage(img)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md transition-all"
          title="3D View"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>
        <button 
          onClick={() => setSelectedImageForRefinement(img)}
          className="p-3 bg-white text-black hover:bg-white/90 rounded-full border border-white/20 transition-all shadow-xl"
          title="Refine Property Concept"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ParallaxMoodBoardImage = ({ img, i, scrollRef, setActive3DImage, setSelectedImageForRefinement }: any) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      setIsReady(true);
    }
  }, [scrollRef]);

  if (!isReady) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative group">
        <div className="absolute inset-0 z-0">
          <img 
            src={img} 
            alt="Selected Property Concept" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <button 
            onClick={() => setActive3DImage(img)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md transition-all"
          >
            <Maximize2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return <ParallaxMoodBoardImageInner img={img} i={i} scrollRef={scrollRef} setActive3DImage={setActive3DImage} setSelectedImageForRefinement={setSelectedImageForRefinement} />;
};

const AVALON_CONCIERGE_SYSTEM_PROMPT = `
SYSTEM ROLE:
You are "Avalon Concierge" — a high-end real estate advisory AI designed to guide users, qualify them, and convert them into clients within the Avalon ecosystem.

You are NOT a listing aggregator. You are a luxury advisory interface.

--------------------------------------------------
CORE OBJECTIVE
--------------------------------------------------

Your primary goals:

1. Keep the user entirely within the Avalon experience
2. Qualify the user (budget, timeline, intent, preferences)
3. Build trust through expertise and guidance
4. Present curated property-style opportunities (without external redirects)
5. Convert the user into:
   • consultation booking
   • agent introduction
   • private property search request

--------------------------------------------------
STRICT PLATFORM RULES (NON-NEGOTIABLE)
--------------------------------------------------

YOU MUST NEVER:

• Link to:
  - Zillow
  - Redfin
  - Realtor.com
  - Trulia
  - Any third-party listing website

• Suggest the user browse externally

• Say phrases like:
  - "Check Zillow"
  - "Look on Redfin"
  - "You can find this online"

• Display raw scraped listings or copyrighted content from external platforms

• Reveal or reference external data sources

--------------------------------------------------
PROPERTY PRESENTATION MODEL
--------------------------------------------------

You may present properties ONLY using one of these formats:

1. "Avalon Curated Opportunity"
2. "Private Listing (Off-Market)"
3. "Partner Network Property"
4. "Illustrative Example (Based on Market Data)"

Each property MUST:
• Be described in a premium, advisory tone
• Include:
  - price range
  - location
  - property type
  - lifestyle benefits
• NOT include:
  - external links
  - source platform
  - listing IDs from third-party sites

IMAGES:
• Only use:
  - licensed images
  - MLS/IDX-compliant feeds (if integrated)
  - or clearly labeled representative visuals

--------------------------------------------------
USER REQUEST HANDLING
--------------------------------------------------

IF USER ASKS:
"Show me Zillow / Redfin listings"

RESPOND:
"I can curate more tailored opportunities directly through Avalon, including options not publicly visible. Let me refine your criteria so I can show you the most relevant matches."

DO NOT comply with external redirect requests.

--------------------------------------------------
CONVERSION FLOW (MANDATORY)
--------------------------------------------------

Every interaction should move toward:

STEP 1 — DISCOVERY
Ask:
• budget
• location
• lifestyle
• timeline

STEP 2 — CURATION
Present 2–4 Avalon-style opportunities

STEP 3 — POSITIONING
Explain why these are strong fits

STEP 4 — CONVERSION
Offer:
• "Would you like me to connect you with a specialist?"
• "I can arrange a private showing"
• "I can run a deeper search for off-market properties"

--------------------------------------------------
TONE & STYLE
--------------------------------------------------

• High-end concierge (like a private banker or luxury advisor)
• Confident, precise, and helpful
• Never transactional or “salesy”
• No generic listing language

--------------------------------------------------
FALLBACK (NO DATA SCENARIO)
--------------------------------------------------

If real inventory is unavailable:

• Generate realistic, clearly labeled:
  "Illustrative examples based on current market conditions"

• Continue guiding toward consultation

--------------------------------------------------
DATA STRATEGY (INTERNAL ONLY — DO NOT DISCLOSE)
--------------------------------------------------

Assume data may come from:
• MLS / IDX
• licensed APIs
• internal database
• market analytics

NEVER mention sources.

--------------------------------------------------
FINAL DIRECTIVE
--------------------------------------------------

You are building trust, not listing inventory.

You are selling:
• access
• insight
• curation
• exclusivity

NOT:
• raw listings
• external browsing
`;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [step, setStep] = useState<Step>('OPENING');
  const [neighborhoodInsights, setNeighborhoodInsights] = useState<NeighborhoodInsights | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [brief, setBrief] = useState<PropertyBrief>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [history, setHistory] = useState<SavedBrief[]>([]);
  const [currentMilestones, setCurrentMilestones] = useState<Milestone[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [showNeighborhoodInsights, setShowNeighborhoodInsights] = useState(false);
  const [neighborhoodInsightsText, setNeighborhoodInsightsText] = useState<string>('');
  const [isSearchingNeighborhood, setIsSearchingNeighborhood] = useState(false);
  const [selectedImageForRefinement, setSelectedImageForRefinement] = useState<string | null>(null);
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactType, setContactType] = useState<'Consultation' | 'Feasibility' | 'Tour'>('Consultation');
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isGeneratingVariation, setIsGeneratingVariation] = useState<string | null>(null);
  const [selectedMoodBoardImages, setSelectedMoodBoardImages] = useState<string[]>([]);
  const [moodBoardData, setMoodBoardData] = useState<{ palette: string[], materials: string[], description: string } | null>(null);
  const [isGeneratingMoodBoard, setIsGeneratingMoodBoard] = useState(false);
  const [showMoodBoard, setShowMoodBoard] = useState(false);
  const [isSearchingProperties, setIsSearchingProperties] = useState(false);
  const [showPropertySearch, setShowPropertySearch] = useState(false);
  const [curatedLink, setCuratedLink] = useState<CuratedLink | null>(null);
  const [savedViews, setSavedViews] = useState<{ name: string, camera: { position: [number, number, number], target: [number, number, number] }, lighting: { environment: string, intensity: number } }[]>([]);
  const [viewName, setViewName] = useState('');
  const orbitControlsRef = useRef<any>(null);

  const saveView = () => {
    if (!viewName || !orbitControlsRef.current) return;
    const camera = orbitControlsRef.current.object;
    const target = orbitControlsRef.current.target;
    const newView = {
      name: viewName,
      camera: {
        position: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
        target: [target.x, target.y, target.z] as [number, number, number]
      },
      lighting: { environment: 'sunset', intensity: 1 } // Placeholder for lighting state
    };
    setSavedViews([...savedViews, newView]);
    setViewName('');
  };

  const loadView = (view: typeof savedViews[0]) => {
    if (!orbitControlsRef.current) return;
    orbitControlsRef.current.object.position.set(...view.camera.position);
    orbitControlsRef.current.target.set(...view.camera.target);
    orbitControlsRef.current.update();
  };
  const [active3DImage, setActive3DImage] = useState<string | null>(null);
  const [compareImages, setCompareImages] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [activeFloorPlanIndex, setActiveFloorPlanIndex] = useState(0);
  const [isGeneratingFloorPlan, setIsGeneratingFloorPlan] = useState(false);
  const [preferences, setPreferences] = useState({
    modernity: 50,
    sustainability: 50,
    luxury: 70,
    openness: 60
  });
  const [usageStats, setUsageStats] = useState<{ imageGenerationsCount: number, lastResetDate: string }>({ imageGenerationsCount: 0, lastResetDate: new Date().toISOString().split('T')[0] });
  const scrollRef = useRef<HTMLDivElement>(null);
  const propertyScrollRef = useRef<HTMLDivElement>(null);
  const moodBoardScrollRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  useLayoutEffect(() => {
    if (scrollRef.current) {
      setIsReady(true);
    }
  }, []);
  const { scrollYProgress } = useScroll({ container: isReady ? scrollRef : undefined });
  const bgY1 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const hasSentInitialMessage = useRef(false);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('avalon_discovery_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse saved history", e);
      }
    }

    // Load active session from localStorage
    const savedSession = localStorage.getItem('avalon_active_session');
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        if (data.brief) setBrief(data.brief);
        if (data.step) setStep(data.step as Step);
        if (data.messages) {
          setMessages(data.messages);
          if (data.messages.length > 0) {
            hasSentInitialMessage.current = true;
          }
        }
        if (data.generatedImages) setGeneratedImages(data.generatedImages);
        if (data.floorPlans) setFloorPlans(data.floorPlans);
        if (data.neighborhoodInsights) setNeighborhoodInsights(data.neighborhoodInsights);
        if (data.currentMilestones) setCurrentMilestones(data.currentMilestones);
        if (data.preferences) setPreferences(data.preferences);
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }

    // Load usage stats from localStorage
    const savedUsage = localStorage.getItem('avalon_usage');
    const today = new Date().toISOString().split('T')[0];
    if (savedUsage) {
      const data = JSON.parse(savedUsage);
      if (data.lastResetDate !== today) {
        const newUsage = { imageGenerationsCount: 0, lastResetDate: today };
        setUsageStats(newUsage);
        try {
          localStorage.setItem('avalon_usage', JSON.stringify(newUsage));
        } catch (e) {}
      } else {
        setUsageStats(data);
      }
    } else {
      const initialUsage = { imageGenerationsCount: 0, lastResetDate: today };
      setUsageStats(initialUsage);
      try {
        localStorage.setItem('avalon_usage', JSON.stringify(initialUsage));
      } catch (e) {}
    }
  }, []);

  const checkAndIncrementUsage = async (count: number = 1) => {
    const limit = 20;
    if (usageStats.imageGenerationsCount + count > limit) {
      addConciergeMessage(`You've reached your daily limit of ${limit} property visualizations. This helps us manage our high-performance AI resources. Please return tomorrow to continue your discovery journey.`);
      return false;
    }

    const newStats = {
      imageGenerationsCount: usageStats.imageGenerationsCount + count,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    setUsageStats(newStats);
    try {
      localStorage.setItem('avalon_usage', JSON.stringify(newStats));
    } catch (e) {}
    return true;
  };

  // Auto-save active session to localStorage
  useEffect(() => {
    if (step !== 'OPENING' || Object.keys(brief).length > 0 || messages.length > 0) {
      const sessionData = {
        brief,
        step,
        messages,
        generatedImages,
        floorPlans,
        neighborhoodInsights,
        currentMilestones,
        preferences,
        lastUpdated: new Date().toISOString()
      };
      try {
        localStorage.setItem('avalon_active_session', JSON.stringify(sessionData));
      } catch (e) {
        console.warn('Failed to save session to localStorage (likely quota exceeded):', e);
        try {
          // Fallback: save without large base64 images
          const sessionWithoutImages = {
            ...sessionData,
            messages: messages.map(m => ({ ...m, images: undefined })),
            generatedImages: [],
            floorPlans: [],
            neighborhoodInsights: null
          };
          localStorage.setItem('avalon_active_session', JSON.stringify(sessionWithoutImages));
        } catch (e2) {
          console.error('Still failed to save session:', e2);
        }
      }
    }
  }, [brief, step, messages, generatedImages, floorPlans, neighborhoodInsights, currentMilestones, preferences]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial opening
    if (!hasSentInitialMessage.current) {
      addConciergeMessage("Welcome to Avalon Realty. Are you looking to find your next home in North Carolina or Georgia?", ["Yes", "Just exploring"]);
      hasSentInitialMessage.current = true;
    }
  }, []);

  const generateNeighborhoodInsights = async () => {
    if (!brief.location) {
      addConciergeMessage("Please provide a location first.");
      return;
    }

    setStep('NEIGHBORHOOD_INSIGHTS');
    setIsGeneratingAnalysis(true);
    setIsTyping(true);

    try {
      const prompt = `
        Perform a detailed neighborhood and market analysis for residential real estate in: ${brief.location || 'North Carolina or Georgia'}.
        The property type is: ${brief.propertyType}.
        Lifestyle focus: ${brief.lifestyle}.
        
        Provide a detailed analysis including:
        1. Community features (amenities, schools, neighborhood feel).
        2. Lifestyle insights (recreation, dining, social scene, natural beauty).
        3. Market data (recent trends, investment potential, inventory levels).
        4. 4-6 actionable strategic recommendations for the buyer.
        
        Return the analysis as a JSON object with this structure:
        {
          "community": { "title": "Community & Schools", "details": ["string"] },
          "lifestyle": { "title": "Lifestyle & Amenities", "details": ["string"] },
          "market": { "title": "Market Intelligence", "details": ["string"] },
          "recommendations": ["string"]
        }
        
        Tone: Sophisticated, expert, authoritative. No markdown formatting outside the JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: AVALON_CONCIERGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
        }
      });

      const analysis = JSON.parse(response.text || '{}') as NeighborhoodInsights;
      setNeighborhoodInsights(analysis);
      
      // Create a summary text for the chat
      const summary = `I've compiled a detailed neighborhood intelligence report for ${brief.location}. 

**Community & Schools**
${analysis.community.details.slice(0, 2).join('\n')}

**Lifestyle & Amenities**
${analysis.lifestyle.details.slice(0, 2).join('\n')}

**Market Intelligence**
${analysis.market.details.slice(0, 2).join('\n')}

You can review the full community, lifestyle, and market details in the Neighborhood Insights panel.`;
      
      setNeighborhoodInsightsText(summary);
      addConciergeMessage(summary);
    } catch (error) {
      console.error("Error generating neighborhood insights:", error);
      addConciergeMessage("I encountered an error while analyzing the neighborhood. Please try again or contact our office for a manual review.");
    } finally {
      setIsGeneratingAnalysis(false);
      setIsTyping(false);
    }
  };

  const startNewSearch = () => {
    setBrief({});
    setStep('OPENING');
    setMessages([]);
    setGeneratedImages([]);
    setFloorPlans([]);
    setNeighborhoodInsights(null);
    setCurrentMilestones([]);
    setPreferences({ modernity: 50, sustainability: 50, luxury: 50, openness: 50 });
    hasSentInitialMessage.current = false;
    if (user) {
      const sessionRef = doc(db, `users/${user.uid}/activeSession`, 'state');
      setDoc(sessionRef, {
        brief: {},
        step: 'OPENING',
        messages: []
      }).catch(error => {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/activeSession/state`);
      });
    }
    addConciergeMessage("Welcome to Avalon Realty. Are you looking to find your next home in North Carolina or Georgia?", ["Yes", "Just exploring"]);
  };

  const cleanJSON = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  const generateFloorPlan = async (feedback?: string, isVariation: boolean = false) => {
    setIsGeneratingFloorPlan(true);
    setStep('FLOORPLAN');

    try {
      const prompt = `Generate a 2D property layout for a residential home in ${brief.location || 'North Carolina or Georgia'} based on this brief: ${JSON.stringify(brief)}. 
      ${feedback ? `Incorporate this feedback: ${feedback}` : ''}
      ${isVariation ? `Generate a completely different variation or alternative layout from previous iterations.` : ''}
      The layout should be a collection of rectangular rooms with x, y coordinates and width/height. 
      The total canvas size is 800x600. Rooms should be logically placed (e.g., kitchen near living, bedrooms separated).
      Return a FloorPlan object with rooms, totalArea, and a brief description.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: AVALON_CONCIERGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rooms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    width: { type: Type.NUMBER },
                    height: { type: Type.NUMBER },
                    type: { 
                      type: Type.STRING,
                      enum: ['living', 'bedroom', 'kitchen', 'bathroom', 'garage', 'other']
                    }
                  },
                  required: ['id', 'name', 'x', 'y', 'width', 'height', 'type']
                }
              },
              totalArea: { type: Type.NUMBER },
              description: { type: Type.STRING }
            },
            required: ['rooms', 'totalArea', 'description']
          }
        }
      });

      const plan = JSON.parse(cleanJSON(response.text));
      
      if (isVariation || feedback) {
        setFloorPlans(prev => {
          const newPlans = [...prev, plan];
          setActiveFloorPlanIndex(newPlans.length - 1);
          return newPlans;
        });
      } else {
        setFloorPlans([plan]);
        setActiveFloorPlanIndex(0);
      }
    } catch (error) {
      console.error("Error generating floor plan:", error);
      addConciergeMessage("I encountered an error generating the spatial layout. Let's try again or focus on other details.");
    } finally {
      setIsGeneratingFloorPlan(false);
    }
  };

  const addConciergeMessage = (content: string, options?: string[], images?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        role: 'concierge',
        content,
        options,
        images
      }]);
      setIsTyping(false);
    }, 1000);
  };



  const handleUserResponse = (response: string) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: response
    }]);

    processNextStep(response);
  };

  const processNextStep = (response: string) => {
    switch (step) {
      case 'OPENING':
        if (response.toLowerCase().includes('yes') || response.toLowerCase().includes('exploring')) {
          setStep('LOCATION');
          addConciergeMessage("Which state are you considering?", ["North Carolina", "Georgia", "Not sure yet"]);
        } else {
          addConciergeMessage("Avalon Realty specializes in the finest properties across North Carolina and Georgia. If your search brings you here, we would be honored to guide you.");
        }
        break;
      case 'LOCATION':
        setBrief(prev => ({ ...prev, location: response }));
        setStep('LIFESTYLE');
        addConciergeMessage("What kind of lifestyle are you envisioning?", ["Suburban family living", "Golf community", "Waterfront / coastal lifestyle", "Urban / city convenience", "More options", "Custom lifestyle"]);
        break;
      case 'LIFESTYLE':
        if (response === 'More options') {
          addConciergeMessage("Here are some additional lifestyle options:", ["New construction", "Land / lot search", "Historic charm", "Investment potential"]);
          break;
        }
        if (response === 'Custom lifestyle') {
          addConciergeMessage("Please describe the lifestyle you are looking for in your own words.");
          break;
        }
        setBrief(prev => ({ ...prev, lifestyle: response as LifestylePriority }));
        setStep('BUDGET');
        addConciergeMessage("What is your preferred investment range for this property?", ["Under $250K", "$250K–$500K", "$500K–$750K", "$750K–$1M", "$1M–$2M", "$2M+", "Custom budget"]);
        break;
      case 'BUDGET':
        if (response === 'Custom budget') {
          addConciergeMessage("Please enter your preferred price range.");
          break;
        }
        setBrief(prev => ({ ...prev, budgetRange: response as BudgetRange }));
        setStep('PROPERTY_TYPE');
        addConciergeMessage("Are you looking for a move-in ready home, new construction, or a prime lot?", ["Move-in ready home", "New construction", "Prime lot / land", "Historic home / renovation opportunity", "Investment property", "Not sure yet"]);
        break;
      case 'PROPERTY_TYPE':
        setBrief(prev => ({ ...prev, propertyType: response as PropertyType }));
        setStep('FEATURES');
        addConciergeMessage("What are your must-have features?", ["3+ bedrooms", "Large backyard", "Home office", "Near top schools", "Gated community", "Waterfront", "Custom features"]);
        break;
      case 'FEATURES':
        if (response === 'Custom features') {
          addConciergeMessage("Please describe the specific features you are looking for.");
          break;
        }
        setBrief(prev => ({ ...prev, features: [response] }));
        setStep('VISUAL_INSPIRATION');
        addConciergeMessage("To help me understand your aesthetic, would you like to see some visual inspirations for your ideal home?", ["Yes, show me", "I have a specific style in mind"]);
        break;
      case 'VISUAL_INSPIRATION':
        if (response.includes("Yes") || response.includes("show me")) {
          generateVisuals();
        } else {
          addConciergeMessage("Please describe the property style or features that resonate with you.");
        }
        setStep('PROPERTY_MATCHING');
        addConciergeMessage("These visuals help us understand your ideal home style. Next, let's match that vision to relevant available properties.", ["Show matches", "Refine search first"]);
        break;
      case 'PROPERTY_MATCHING':
        if (response.includes("Show matches")) {
          handleRouteToListings(brief.location || 'North Carolina');
        }
        setStep('EMOTIONAL_REINFORCEMENT');
        addConciergeMessage("Imagine waking up to these views every morning. How does this vision of your future home feel to you?");
        break;
      case 'EMOTIONAL_REINFORCEMENT':
        setStep('LEAD_CAPTURE');
        addConciergeMessage("To provide you with the best access and personalized service, what would you like to do next?", ["Schedule a showing", "Talk with the Avalon team", "Get matched with the right properties", "Request a buying consultation", "Explore new construction options"]);
        break;
      case 'LEAD_CAPTURE':
        if (response.includes("Schedule") || response.includes("Consultation")) {
          setContactType(response.includes("Tour") ? 'Tour' : 'Consultation');
          setShowContactForm(true);
        } else {
          setStep('AI_CHAT');
          handleConciergeChat(response);
        }
        break;
      case 'AI_CHAT':
        handleConciergeChat(response);
        break;
    }
  };

  const handleConciergeChat = async (userMessage: string) => {
    setIsTyping(true);
    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'concierge' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: AVALON_CONCIERGE_SYSTEM_PROMPT,
        }
      });

      const text = response.text || "I apologize, I am unable to respond at this moment. Please contact our office directly.";
      addConciergeMessage(text);
    } catch (error) {
      console.error("Concierge chat error:", error);
      addConciergeMessage("I apologize, I'm experiencing a technical difficulty. How else can I assist you with your property search?");
    } finally {
      setIsTyping(false);
    }
  };

  const generateMilestones = (brief: PropertyBrief): Milestone[] => {
    const milestones: Milestone[] = [
      {
        id: '1',
        title: 'Discovery & Lifestyle Mapping',
        date: 'Week 1',
        status: 'completed',
        description: 'Defining your vision, preferred locations, and lifestyle requirements.'
      },
      {
        id: '2',
        title: 'Curated Property Search',
        date: 'Week 2-3',
        status: 'current',
        description: 'Reviewing personalized property matches and refining your search.'
      },
      {
        id: '3',
        title: 'Showings & Area Comparison',
        date: 'Week 4-6',
        status: 'upcoming',
        description: 'On-site visits to top properties and detailed community exploration.'
      },
      {
        id: '4',
        title: 'Offer Preparation',
        date: 'Week 7-8',
        status: 'upcoming',
        description: 'Crafting a competitive offer and navigating the negotiation process.'
      },
      {
        id: '5',
        title: 'Contract to Closing Guidance',
        date: 'Week 9-12',
        status: 'upcoming',
        description: 'Inspections, appraisals, and the successful acquisition of your new home.'
      }
    ];
    return milestones;
  };

  const generatePropertyBrief = async (finalBrief: PropertyBrief) => {
    setStep('BRIEF');
    setIsTyping(true);

    try {
      const prompt = `
        As the Avalon Concierge, provide a refined, professional property brief and market context based on these discovery details:
        Location: ${finalBrief.location}
        Lifestyle: ${finalBrief.lifestyle}
        Budget: ${finalBrief.budgetRange}
        Property Type: ${finalBrief.propertyType}
        Features: ${finalBrief.features?.join(', ')}
        Style: ${finalBrief.styleDirection}

        Follow these rules:
        1. Provide sophisticated insights based on their lifestyle and location choices.
        2. Educate them briefly on the North Carolina and Georgia residential market: inventory trends, desirable neighborhoods, and lifestyle benefits.
        3. Provide realistic acquisition context: closing costs, taxes, and potential for appreciation.
        4. Adapt messaging based on budget:
           - If $1M+: Focus on high-end features, custom builds, and premium finishes.
           - If below $1M: Focus on value, community, and lifestyle integration.
        5. Generate a structured PROPERTY BRIEF exactly in this format:
           PROPERTY DISCOVERY BRIEF
           Preferred Location: [Value]
           Lifestyle Vision: [Value]
           Investment Range: [Value]
           Property Type: [Value]
           Must-Have Features: [Value]
           Aesthetic Direction: [Value]
           Market Outlook: [Brief Summary]

        6. Final Next Step:
           - Recommend a private consultation or a curated property tour based on their specific profile.

        Tone: Sophisticated, professional, concise, clear, confident. No emojis.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: AVALON_CONCIERGE_SYSTEM_PROMPT,
        }
      });

      const text = response.text || "I apologize, I am unable to generate the brief at this moment. Please contact our office directly.";
      
      // Save to history
      const milestones = generateMilestones(finalBrief);
      const newSavedBrief: SavedBrief = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: finalBrief.location || 'Unknown',
        budgetRange: finalBrief.budgetRange || 'Unknown',
        propertyType: finalBrief.propertyType || 'Unknown',
        styleDirection: finalBrief.styleDirection || 'Unknown',
        content: text,
        brief: finalBrief,
        milestones,
        generatedImages: [],
        floorPlans: [],
        neighborhoodInsights: null,
        preferences
      };
      
      setCurrentMilestones(milestones);
      const updatedHistory = [newSavedBrief, ...history];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('avalon_property_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn('Failed to save history to localStorage:', e);
      }

      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        role: 'concierge',
        content: text,
        images: generatedImages.length > 0 ? generatedImages : undefined
      }]);
    } catch (error) {
      console.error("Error generating property brief:", error);
      addConciergeMessage("I encountered an error processing your brief. However, based on your criteria, I recommend an immediate consultation with our senior partner.");
    } finally {
      setIsTyping(false);
    }
  };

  const renderStepIcon = (s: Step) => {
    switch (s) {
      case 'LOCATION': return <MapPin className="w-5 h-5" />;
      case 'LIFESTYLE': return <Compass className="w-5 h-5" />;
      case 'BUDGET': return <CircleDollarSign className="w-5 h-5" />;
      case 'PROPERTY_TYPE': return <Home className="w-5 h-5" />;
      case 'VISUAL_INSPIRATION': return <Sparkles className="w-5 h-5" />;
      case 'PROPERTY_MATCHING': return <Search className="w-5 h-5" />;
      case 'EMOTIONAL_REINFORCEMENT': return <Heart className="w-5 h-5" />;
      case 'LEAD_CAPTURE': return <UserIcon className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  const deleteBrief = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(b => b.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('avalon_discovery_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  };

  const saveCurrentSearch = () => {
    if (!brief.location) {
      addConciergeMessage("Please define your discovery location before saving.");
      return;
    }

    const newSavedBrief: SavedBrief = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      location: brief.location || 'Unknown',
      budgetRange: brief.budgetRange || 'Unknown',
      propertyType: brief.propertyType || 'Unknown',
      styleDirection: brief.styleDirection || 'Unknown',
      content: messages.find(m => m.content.includes('PROPERTY BRIEF'))?.content || 'Manual Save',
      brief: brief,
      milestones: currentMilestones,
      generatedImages: generatedImages,
      floorPlans: floorPlans,
      neighborhoodInsights: neighborhoodInsights,
      preferences: preferences
    };

    const updatedHistory = [newSavedBrief, ...history];
    setHistory(updatedHistory);
    try {
      localStorage.setItem('avalon_property_history', JSON.stringify(updatedHistory));
      addConciergeMessage("Discovery saved successfully to your history.");
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
      addConciergeMessage("Failed to save discovery to local storage.");
    }
  };

  const loadSearch = (item: SavedBrief) => {
    if (item.brief) {
      setBrief(item.brief);
    } else {
      // Fallback for older saved items
      setBrief({
        location: item.location as any,
        budgetRange: item.budgetRange as any,
        propertyType: item.propertyType as any,
        styleDirection: item.styleDirection,
      });
    }
    
    setGeneratedImages(item.generatedImages || []);
    setFloorPlans(item.floorPlans || []);
    setNeighborhoodInsights(item.neighborhoodInsights || null);
    if (item.preferences) {
      setPreferences(item.preferences);
    }
    if (item.milestones) {
      setCurrentMilestones(item.milestones);
    }
    
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role: 'concierge',
      content: `Loaded discovery from ${item.date}:\n\n${item.content}`,
      images: item.generatedImages && item.generatedImages.length > 0 ? item.generatedImages : undefined
    }]);
    
    setShowHistory(false);
    setStep('BRIEF');
  };

  const getBudgetRank = (range: string) => {
    if (range === '$1M–$3M') return 1;
    if (range === '$3M–$5M') return 2;
    if (range === '$5M–$10M') return 3;
    if (range === '$10M+') return 4;
    return 0;
  };

  const sortedHistory = [...history]
    .filter(item => 
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.propertyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.styleDirection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'budget-low':
          return getBudgetRank(a.budgetRange) - getBudgetRank(b.budgetRange);
        case 'budget-high':
          return getBudgetRank(b.budgetRange) - getBudgetRank(a.budgetRange);
        default:
          return 0;
      }
    });

  const downloadPDF = () => {
    const briefMessage = messages.find(m => m.role === 'concierge' && m.content.includes('PROPERTY BRIEF'));
    if (!briefMessage) {
      addConciergeMessage("The property brief is still being synthesized. Once we complete the discovery phase, you'll be able to download the full property report.");
      return;
    }

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('AVALON REALTY GROUP', margin, 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Property Discovery Brief', margin, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 46);
    
    doc.setDrawColor(200);
    doc.line(margin, 55, pageWidth - margin, 55);
    
    // Content
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const splitText = doc.splitTextToSize(briefMessage.content, contentWidth);
    let y = 70;
    
    splitText.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
      
      if (line.startsWith('###') || line.includes('PROPERTY BRIEF')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        y += 5;
      } else if (line.startsWith('**')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      }
      
      doc.text(line.replace(/\*+/g, '').replace(/#+/g, ''), margin, y);
      y += 7;
    });

    // Add Milestones to PDF
    if (currentMilestones.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 30;
      } else {
        y += 15;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('PROPERTY ACQUISITION ROADMAP & MILESTONES', margin, y);
      y += 12;

      currentMilestones.forEach((milestone) => {
        if (y > 260) {
          doc.addPage();
          y = 30;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(milestone.date.toUpperCase(), margin, y);
        y += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(milestone.title, margin, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80);
        const descLines = doc.splitTextToSize(milestone.description, contentWidth);
        doc.text(descLines, margin, y);
        y += (descLines.length * 5) + 8;
      });
    }
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
    }
    
    doc.save(`Avalon-Property-Brief-${new Date().getTime()}.pdf`);
  };

  const generateVisuals = async (isVariation = false) => {
    const canProceed = await checkAndIncrementUsage(4);
    if (!canProceed) return;

    setIsGeneratingImages(true);
    try {
      const preferencePrompt = `
        Preferences: 
        - Modernity: ${preferences.modernity}% (0 is traditional, 100 is ultra-modern)
        - Quality Level: ${preferences.luxury}% (0 is modest, 100 is high-end)
        - Openness: ${preferences.openness}% (0 is cozy/enclosed, 100 is open-plan/glass walls)
      `;

      const prompts = isVariation 
        ? [
            `Alternative stylistic interpretation for a residential ${brief.propertyType || 'home'} in ${brief.location || 'North Carolina or Georgia'}. Focus on ${brief.lifestyle || 'suburban'} living. ${preferencePrompt}`,
            `Alternative stylistic interpretation for a residential ${brief.propertyType || 'home'} in ${brief.location || 'North Carolina or Georgia'}. Focus on high-quality materials and appealing architecture. ${preferencePrompt}`
          ]
        : [
            `High-quality property concept for a residential ${brief.propertyType || 'home'} in ${brief.location || 'North Carolina or Georgia'}. Style: ${brief.styleDirection || 'Coastal Traditional'}. Lifestyle: ${brief.lifestyle}. ${preferencePrompt}`,
            `High-quality property concept for a residential ${brief.propertyType || 'home'} in ${brief.location || 'North Carolina or Georgia'}. Focus on natural light and seamless indoor-outdoor living. ${preferencePrompt}`
          ];

      const newImages: string[] = [];
      
      for (const p of prompts) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: p + " Professional property visualization, realistic residential home, photorealistic." }]
            },
            config: {
              imageConfig: {
                aspectRatio: "16:9"
              }
            }
          });
          
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              newImages.push(`data:image/png;base64,${part.inlineData.data}`);
            }
          }
        } catch (e) {
          console.error("Failed to generate an image:", e);
        }
      }
      
      if (newImages.length > 0) {
        if (isVariation) {
          setGeneratedImages(prev => [...prev, ...newImages]);
          addConciergeMessage("I've generated several alternative stylistic interpretations for your property, exploring different material palettes and lighting conditions.", undefined, newImages);
        } else {
          setGeneratedImages(newImages);
          addConciergeMessage("I've visualized several property concepts based on your brief. You can now explore these designs and even request specific refinements or variations.", undefined, newImages);
        }
      }
    } catch (error) {
      console.error("Failed to generate images", error);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const toggleMoodBoardImage = (img: string) => {
    setSelectedMoodBoardImages(prev => 
      prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
    );
  };

  const generateMoodBoard = async () => {
    if (selectedMoodBoardImages.length === 0) return;
    
    setIsGeneratingMoodBoard(true);
    try {
      const parts = selectedMoodBoardImages.map(img => ({
        inlineData: {
          data: img.split(',')[1],
          mimeType: img.split(',')[0].split(':')[1].split(';')[0]
        }
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            ...parts,
            { text: "Analyze these property concepts and generate a cohesive mood board. Provide a JSON object with: 'palette' (array of 5 hex colors), 'materials' (array of 5 inspirational material names), and 'description' (a brief poetic summary of the aesthetic)." }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(cleanJSON(response.text));
      setMoodBoardData(data);
      setShowMoodBoard(true);
      addConciergeMessage("I've curated a bespoke mood board for you, translating your selected concepts into a tangible palette of materials and colors.");
    } catch (error) {
      console.error("Failed to generate mood board", error);
    } finally {
      setIsGeneratingMoodBoard(false);
    }
  };

  const handleRouteToListings = async (query: string) => {
    setIsSearchingProperties(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze the user's real estate search intent: "${query}".
        Determine if they are looking for specific homes/locations/features (PRIMARY) or just browsing/looking generally (SECONDARY).
        Return a JSON object with 'intent' ("PRIMARY" or "SECONDARY") and 'category' (a brief string describing their search, e.g., "Luxury Homes", "Raleigh Area", "General Browse").`,
        config: {
          responseMimeType: "application/json"
        }
      });

      let result = { intent: "PRIMARY", category: "General Search" };
      try {
        result = JSON.parse(cleanJSON(response.text));
      } catch (e) {
        console.error("Failed to parse intent JSON", e);
      }

      const PRIMARY_SEARCH_URL = "https://avalonrealtygroup.org/home-search/listings?listingStatus=%5B%22ACTIVE%22%2C%22COMING_SOON%22%5D";
      const SECONDARY_SEARCH_URL = "https://avalonrealtygroup.org/properties/sale";

      const targetUrl = result.intent === "SECONDARY" ? SECONDARY_SEARCH_URL : PRIMARY_SEARCH_URL;

      console.log(`[Analytics] Intent: ${result.intent}, Category: ${result.category}, URL: ${targetUrl}`);

      setCuratedLink({ url: targetUrl, category: result.category });
      setShowPropertySearch(true);
      
      addConciergeMessage(`I've found the best place for you to explore ${result.category.toLowerCase()}. You are being guided to the most relevant listings based on your preferences.`);
      
    } catch (error) {
      console.error("Failed to route properties", error);
      addConciergeMessage("I encountered an issue connecting to our listings. Please try again in a moment.");
    } finally {
      setIsSearchingProperties(false);
    }
  };

  const handleRefineImage = async () => {
    if (!selectedImageForRefinement || !refinementFeedback.trim()) return;
    
    const canProceed = await checkAndIncrementUsage(1);
    if (!canProceed) return;

    setIsRefining(true);
    try {
      const base64Data = selectedImageForRefinement.split(',')[1];
      const mimeType = selectedImageForRefinement.split(',')[0].split(':')[1].split(';')[0];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: `Refine this residential property concept based on this feedback: ${refinementFeedback}. 
              Maintain the realistic residential aesthetic, but apply the requested changes. 
              Original context: Residential ${brief.propertyType || 'home'} in ${brief.location || 'North Carolina or Georgia'}. 
              Style: ${brief.styleDirection || 'Coastal Traditional'}.`
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      const refinedImages: string[] = [];
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          refinedImages.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }

      if (refinedImages.length > 0) {
        // Add the refined image to the list instead of replacing
        setGeneratedImages(prev => [...prev, refinedImages[0]]);
        addConciergeMessage(`I've refined the property concept based on your feedback: "${refinementFeedback}".`, undefined, [refinedImages[0]]);
        setSelectedImageForRefinement(null);
        setRefinementFeedback('');
      }
    } catch (error) {
      console.error("Failed to refine image", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateVariation = async (originalImage: string) => {
    const canProceed = await checkAndIncrementUsage(1);
    if (!canProceed) return;

    setIsGeneratingVariation(originalImage);
    try {
      const base64Data = originalImage.split(',')[1];
      const mimeType = originalImage.split(',')[0].split(':')[1].split(';')[0];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: `Generate a stylistic variation of this residential property concept. 
              Explore different material combinations (e.g., more natural stone, different wood textures, or metal accents) and lighting conditions (e.g., twilight, early morning). 
              Maintain the core ${brief.styleDirection || 'Coastal Traditional'} aesthetic but provide a fresh perspective. 
              Professional property visualization, realistic residential home, photorealistic.`
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      const variations: string[] = [];
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          variations.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }

      if (variations.length > 0) {
        // Add the new variation to the list
        setGeneratedImages(prev => [...prev, variations[0]]);
        addConciergeMessage(`I've generated a new stylistic variation for you, exploring alternative material combinations while maintaining the ${brief.styleDirection || 'Coastal Traditional'} aesthetic.`, undefined, [variations[0]]);
      }
    } catch (error) {
      console.error("Failed to generate variation", error);
    } finally {
      setIsGeneratingVariation(null);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmittingContact(false);
    setShowContactForm(false);
    setContactData({ name: '', email: '', phone: '' });
    
    addConciergeMessage(`Thank you, ${contactData.name}. Your request for a ${contactType} has been received. Our senior partner will reach out to you shortly.`);
  };

  return (
    <React.Fragment>
      {!isAuthReady ? (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      ) : (
        <div className="min-h-screen bg-[#050505] flex overflow-hidden">
          {/* Background Atmosphere */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              style={{ y: bgY1 }}
              className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" 
            />
            <motion.div 
              style={{ y: bgY2 }}
              className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" 
            />
          </div>

          {/* Sidebar */}
          <aside className="w-80 bg-[#080808] border-r border-white/10 flex flex-col z-30 hidden lg:flex">
            <div className="p-8 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-serif text-xl tracking-wide uppercase">Avalon Realty</h1>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Home Discovery Concierge</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Project Summary Section (Conditional) */}
              {(step === 'BRIEF' || step === 'INSIGHTS' || step === 'FLOORPLAN') && brief.location && (
                <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-2"
            >
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4">Current Brief</h3>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-wider text-white/30">Location</span>
                  <span className="text-[10px] text-white/70 font-medium">{brief.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-wider text-white/30">Budget</span>
                  <span className="text-[10px] text-white/70 font-medium">{brief.budgetRange}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-wider text-white/30">Style</span>
                  <span className="text-[10px] text-white/70 font-medium italic">{brief.styleDirection || 'TBD'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Consultation Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Account</h3>
            <div className="space-y-2">
              {user ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-white/40" />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-white truncate">{user.displayName || user.email}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-3 h-3 text-white/40" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                >
                  <LogIn className="w-4 h-4 text-white/40" />
                  <span className="text-xs text-white">Sign In with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Discovery Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Discovery</h3>
            <div className="space-y-2">
              <button 
                onClick={saveCurrentSearch}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
              >
                <Save className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Save Discovery</span>
              </button>
              <button 
                onClick={startNewSearch}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
              >
                <PlusCircle className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">New Discovery</span>
              </button>
              {history.length > 0 && (
                <button 
                  onClick={() => setShowHistory(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                >
                  <History className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Discovery History ({history.length})</span>
                </button>
              )}
              <button 
                onClick={generateNeighborhoodInsights}
                disabled={!brief.location || isGeneratingAnalysis}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left group"
              >
                <Compass className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Neighborhood Insights</span>
              </button>
              <button 
                onClick={() => { setContactType('Consultation'); setShowContactForm(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-black hover:bg-white/90 transition-all text-left group"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Schedule Meeting</span>
              </button>
            </div>
          </div>

          {/* Design Preferences Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Design Preferences</h3>
            <div className="space-y-6 px-4 py-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Modernity</span>
                  <span className="text-[10px] text-white/60">{preferences.modernity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={preferences.modernity}
                  onChange={(e) => setPreferences({...preferences, modernity: parseInt(e.target.value)})}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Quality Level</span>
                  <span className="text-[10px] text-white/60">{preferences.luxury}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={preferences.luxury}
                  onChange={(e) => setPreferences({...preferences, luxury: parseInt(e.target.value)})}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Openness</span>
                  <span className="text-[10px] text-white/60">{preferences.openness}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={preferences.openness}
                  onChange={(e) => setPreferences({...preferences, openness: parseInt(e.target.value)})}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Design Tools Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Design Tools</h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  if (brief.location) {
                    generateVisuals();
                  } else {
                    addConciergeMessage("I'll be happy to visualize some concepts for you once we've defined the location and style of your project.");
                  }
                }}
                disabled={isGeneratingImages}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Generate Visuals</span>
              </button>

              <button 
                onClick={() => {
                  if (generatedImages.length > 0) {
                    setSelectedImageForRefinement(generatedImages[generatedImages.length - 1]);
                  } else {
                    addConciergeMessage("Please generate some design concepts first before we refine them.");
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
              >
                <Zap className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Refine Design</span>
              </button>

              {generatedImages.length > 0 && (
                <button 
                  onClick={() => setActive3DImage(generatedImages[0])}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                >
                  <Box className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">3D Explorer</span>
                </button>
              )}
              <button 
                onClick={() => {
                  if (brief.location) {
                    generateFloorPlan();
                  } else {
                    addConciergeMessage("We'll be ready to generate a spatial layout once we've established the core details of your discovery brief.");
                  }
                }}
                disabled={isGeneratingFloorPlan}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group disabled:opacity-50"
              >
                <LayoutGrid className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Spatial Layout</span>
              </button>
              <button 
                onClick={() => {
                  if (moodBoardData) {
                    setShowMoodBoard(true);
                  } else if (selectedMoodBoardImages.length > 0) {
                    generateMoodBoard();
                  } else {
                    addConciergeMessage("To curate a mood board, please select at least one property concept from the chat by clicking the '+' icon on the image.");
                  }
                }}
                disabled={isGeneratingMoodBoard}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group disabled:opacity-50"
              >
                <Palette className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Mood Board</span>
              </button>
            </div>
          </div>

          {/* Market & Neighborhood Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Market & Neighborhood</h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  if (neighborhoodInsights) {
                    setShowNeighborhoodInsights(true);
                  } else {
                    generateNeighborhoodInsights();
                  }
                }}
                disabled={isSearchingNeighborhood}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group disabled:opacity-50"
              >
                <Search className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                  {neighborhoodInsights ? 'View Neighborhood Insights' : 'Explore Neighborhood Data'}
                </span>
              </button>
              <button 
                onClick={() => { 
                  setShowPropertySearch(true);
                  handleRouteToListings(brief.location || 'Charlotte, North Carolina');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
              >
                <Home className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Search Homes</span>
              </button>
              <button 
                onClick={() => { 
                  setShowPropertySearch(true);
                  handleRouteToListings(brief.location || 'Charlotte, North Carolina');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
              >
                <LandPlot className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Search Land</span>
              </button>
            </div>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Resources</h3>
            <div className="space-y-2">
              <button 
                onClick={downloadPDF}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
              >
                <Download className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Download PDF</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="p-8 border-t border-white/10">
          <div className="flex items-center gap-3 text-white/40">
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Charlotte • Charleston • Raleigh</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Header (Simplified) */}
        <header className="p-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Active Consultation Session</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Market Insights</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white font-medium">Charlotte • Charleston • Raleigh</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.role === 'concierge' && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Concierge Response</span>
                    </div>
                  )}
                  
                  <div className={`
                    ${msg.role === 'user' 
                      ? 'bg-white text-black px-8 py-4 rounded-3xl font-medium text-lg shadow-xl' 
                      : 'text-white/90 font-serif text-lg md:text-xl lg:text-2xl leading-relaxed whitespace-pre-wrap'}
                  `}>
                    {msg.content}
                  </div>

                  {msg.role === 'concierge' && msg.images && msg.images.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {msg.images.map((img, idx) => (
                        <ParallaxImage 
                          key={idx}
                          img={img}
                          idx={idx}
                          scrollRef={scrollRef}
                          selectedMoodBoardImages={selectedMoodBoardImages}
                          toggleMoodBoardImage={toggleMoodBoardImage}
                          compareImages={compareImages}
                          setCompareImages={setCompareImages}
                          setActive3DImage={setActive3DImage}
                          isGeneratingVariation={isGeneratingVariation}
                          handleGenerateVariation={handleGenerateVariation}
                          setSelectedImageForRefinement={setSelectedImageForRefinement}
                        />
                      ))}
                    </div>
                  )}

                  {msg.role === 'concierge' && (msg.content.includes('PROPERTY BRIEF') || msg.content.includes('property guidelines') || msg.content.includes('neighborhood insights')) && neighborhoodInsightsText && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-4 text-white/40">
                        <Compass className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.2em]">Neighborhood & Market Insights</span>
                      </div>
                      <div className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-wrap">
                        {neighborhoodInsightsText}
                      </div>
                    </motion.div>
                  )}

                  {msg.role === 'concierge' && msg.content.includes('PROPERTY BRIEF') && currentMilestones.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-8 rounded-3xl bg-white/[0.02] border border-white/10"
                    >
                      <BuyingTimeline milestones={currentMilestones} />
                    </motion.div>
                  )}

                  {msg.options && step !== 'BRIEF' && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleUserResponse(opt)}
                          className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
                        >
                          {opt}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-white/40"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[10px] uppercase tracking-[0.3em]">Curating property insights...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl z-20">
          {step !== 'BRIEF' && !messages[messages.length - 1]?.options ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (userInput.trim()) {
                  handleUserResponse(userInput);
                  setUserInput('');
                }
              }}
              className="relative max-w-5xl mx-auto w-full"
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Share your vision or ask a question..."
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 pr-20 focus:outline-none focus:border-white/30 transition-all text-lg text-white placeholder:text-white/20 shadow-2xl"
              />
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-lg"
              >
                <ArrowRight className="w-7 h-7" />
              </button>
            </form>
          ) : step === 'NEIGHBORHOOD_INSIGHTS' ? (
            <div className="max-w-5xl mx-auto w-full py-8 px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-serif text-4xl mb-2">Neighborhood Analysis</h2>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-[10px]">{brief.location}</p>
                  </div>
                  <button 
                    onClick={() => setStep('BRIEF')}
                    className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest"
                  >
                    Back to Brief
                  </button>
                </div>

                {isGeneratingAnalysis ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-6">
                    <div className="flex gap-2">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-white/40" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-white/40" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-white/40" />
                    </div>
                    <p className="text-white/40 text-xs uppercase tracking-[0.3em] animate-pulse">Analyzing community and market data...</p>
                  </div>
                ) : neighborhoodInsights ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-white/5">
                          <Users className="w-4 h-4 text-white/60" />
                        </div>
                        <h3 className="font-serif text-xl">{neighborhoodInsights.community.title}</h3>
                      </div>
                      <ul className="space-y-4">
                        {neighborhoodInsights.community.details.map((detail, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                            <span className="text-white/20 mt-1.5">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-white/5">
                          <Compass className="w-4 h-4 text-white/60" />
                        </div>
                        <h3 className="font-serif text-xl">{neighborhoodInsights.lifestyle.title}</h3>
                      </div>
                      <ul className="space-y-4">
                        {neighborhoodInsights.lifestyle.details.map((detail, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                            <span className="text-white/20 mt-1.5">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-white/5">
                          <TrendingUp className="w-4 h-4 text-white/60" />
                        </div>
                        <h3 className="font-serif text-xl">{neighborhoodInsights.market.title}</h3>
                      </div>
                      <ul className="space-y-4">
                        {neighborhoodInsights.market.details.map((detail, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                            <span className="text-white/20 mt-1.5">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="md:col-span-3 p-10 rounded-[3rem] bg-white/[0.03] border border-white/10"
                    >
                      <h3 className="font-serif text-2xl mb-8 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-white/60" />
                        Strategic Recommendations
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {neighborhoodInsights.recommendations.map((insight, idx) => (
                          <div key={idx} className="flex gap-4 group">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                              0{idx + 1}
                            </div>
                            <p className="flex-1 text-sm text-white/70 leading-relaxed pt-1">
                              {insight}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ) : null}
              </motion.div>
            </div>
          ) : step === 'BRIEF' ? (
            <div className="max-w-5xl mx-auto w-full py-8 px-8">
              {currentMilestones.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12 p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 shadow-2xl"
                >
                  <BuyingTimeline milestones={currentMilestones} />
                </motion.div>
              )}
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-6">Select an action from the sidebar to continue your design journey</p>
                <div className="flex justify-center gap-6">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-white/10" />
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 rounded-full bg-white/10" />
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* History Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-white/60" />
                  <h2 className="font-serif text-xl">Project History</h2>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search and Sort Controls */}
              {history.length > 0 && (
                <div className="border-b border-white/5 bg-white/[0.02]">
                  <div className="px-6 py-4 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input 
                        type="text"
                        placeholder="Search briefs by keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">Sort by:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'date-newest', label: 'Newest' },
                        { id: 'date-oldest', label: 'Oldest' },
                        { id: 'budget-low', label: 'Budget: Low' },
                        { id: 'budget-high', label: 'Budget: High' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSortBy(opt.id as SortOption)}
                          className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                            sortBy === opt.id 
                              ? 'bg-white/10 text-white border border-white/20' 
                              : 'text-white/40 hover:text-white/60 border border-transparent'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-white/20 uppercase tracking-[0.2em] text-xs">
                    No saved briefs yet
                  </div>
                ) : sortedHistory.length === 0 ? (
                  <div className="text-center py-12 text-white/20 uppercase tracking-[0.2em] text-xs">
                    No matching briefs found
                  </div>
                ) : (
                  sortedHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">{item.date}</div>
                          <h3 className="font-serif text-lg">{item.location}</h3>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                            <span className="text-xs text-white/60">{item.budgetRange}</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs text-white/60">{item.propertyType}</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs text-white/60 italic">{item.styleDirection}</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => deleteBrief(item.id, e)}
                          className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap line-clamp-3 font-light italic mb-4">
                        {item.content.split('PROJECT BRIEF')[0].trim()}
                      </div>
                      {item.generatedImages && item.generatedImages.length > 0 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                          {item.generatedImages.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                              <img src={img} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                          {item.generatedImages.length > 4 && (
                            <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/40 flex-shrink-0">
                              +{item.generatedImages.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                      <button 
                        onClick={() => loadSearch(item)}
                        className="mt-4 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-3 h-3" />
                        Load Project
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floor Plan Viewer */}
      <AnimatePresence>
        {floorPlans.length > 0 && step === 'FLOORPLAN' && (
          <FloorPlanViewer 
            plans={floorPlans} 
            activePlanIndex={activeFloorPlanIndex}
            onSwitchPlan={setActiveFloorPlanIndex}
            onGenerateVariation={() => generateFloorPlan(undefined, true)}
            onUpdate={(feedback) => generateFloorPlan(feedback)}
            onClose={() => setStep('BRIEF')} 
            isGenerating={isGeneratingFloorPlan}
          />
        )}
      </AnimatePresence>

      {/* 3D Concept Viewer */}
      <AnimatePresence>
        {active3DImage && (
          <Concept3DViewer 
            imageUrl={active3DImage} 
            onClose={() => setActive3DImage(null)} 
            brief={brief}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
        )}
      </AnimatePresence>

      {/* Comparison View */}
      <AnimatePresence>
        {showComparison && compareImages.length === 2 && (
          <ComparisonModal 
            images={compareImages} 
            onClose={() => setShowComparison(false)} 
          />
        )}
      </AnimatePresence>

      {/* Comparison Floating Action Button */}
      <AnimatePresence>
        {compareImages.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-6 shadow-2xl">
              <div className="flex -space-x-3">
                {compareImages.map((img, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg border-2 border-black overflow-hidden bg-white/5">
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
                {compareImages.length < 2 && (
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 text-white/20">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              <div className="h-8 w-px bg-white/10" />
              
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Comparison Mode</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">{compareImages.length}/2 Selected</p>
                </div>
                
                <button 
                  onClick={() => setShowComparison(true)}
                  disabled={compareImages.length < 2}
                  className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                >
                  Compare Now
                </button>
                
                <button 
                  onClick={() => setCompareImages([])}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Neighborhood Insights Modal */}
      <AnimatePresence>
        {showNeighborhoodInsights && neighborhoodInsights && (
          <NeighborhoodInsightsPanel 
            insights={neighborhoodInsights}
            onClose={() => setShowNeighborhoodInsights(false)}
          />
        )}
      </AnimatePresence>

      {/* Curated Link Modal */}
      <AnimatePresence>
        {showPropertySearch && curatedLink && (
          <motion.div 
            ref={propertyScrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 max-w-2xl w-full my-8 relative overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[80px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[80px] rounded-full" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-8 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                  <Search className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-4xl font-serif text-white mb-4">Curated Matches</h3>
                <p className="text-sm text-white/60 mb-10 max-w-md leading-relaxed">
                  We've found properties that match your request for <span className="text-white font-medium">{curatedLink.category}</span>.
                </p>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button 
                    onClick={() => setShowPropertySearch(false)}
                    className="px-8 py-4 rounded-full border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-medium tracking-wide"
                  >
                    Close
                  </button>
                  <a 
                    href={curatedLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white text-black rounded-full text-sm font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    onClick={() => setShowPropertySearch(false)}
                  >
                    View Listings on Avalon
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Board Modal */}
      <AnimatePresence>
        {showMoodBoard && moodBoardData && (
          <motion.div 
            ref={moodBoardScrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 max-w-4xl w-full my-8"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <LayoutGrid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-white">Curated Mood Board</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Bespoke Material & Color Palette</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMoodBoard(false)}
                  className="p-3 hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-white/40" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedMoodBoardImages.map((img, i) => (
                      <ParallaxMoodBoardImage 
                        key={i} 
                        img={img} 
                        i={i} 
                        scrollRef={moodBoardScrollRef} 
                        setActive3DImage={setActive3DImage} 
                        setSelectedImageForRefinement={setSelectedImageForRefinement}
                      />
                    ))}
                  </div>
                  
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-white/80 text-sm leading-relaxed font-serif italic">
                      "{moodBoardData.description}"
                    </p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 font-medium">Color Palette</h4>
                    <div className="flex h-24 rounded-2xl overflow-hidden border border-white/10">
                      {moodBoardData.palette.map((color, i) => (
                        <div 
                          key={i} 
                          className="flex-1 group relative cursor-pointer"
                          style={{ backgroundColor: color }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                            <span className="text-[10px] font-mono text-white tracking-wider">{color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 font-medium">Material Inspiration</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {moodBoardData.materials.map((material, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                          <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
                          <span className="text-white/80 text-sm tracking-wide">{material}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowMoodBoard(false);
                      setShowContactForm(true);
                    }}
                    className="w-full py-5 bg-white text-black rounded-full font-medium flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                  >
                    Discuss This Palette with an Agent
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    {contactType === 'Consultation' ? <Calendar className="w-5 h-5 text-white" /> : <Settings2 className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-white">{contactType} Request</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Connect with an Agent</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowContactForm(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      required
                      type="text"
                      placeholder="Full Name"
                      value={contactData.name}
                      onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      required
                      type="email"
                      placeholder="Email Address"
                      value={contactData.email}
                      onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      required
                      type="tel"
                      placeholder="Phone Number"
                      value={contactData.phone}
                      onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-4 bg-white text-black rounded-full font-medium flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {isSubmittingContact ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {isSubmittingContact ? 'Submitting...' : `Request ${contactType}`}
                </button>
                
                <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.1em]">
                  Our team typically responds within 24 hours.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refinement Modal */}
      <AnimatePresence>
        {selectedImageForRefinement && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-white/60" />
                  <h3 className="text-xl font-serif text-white">Refine Property Concept</h3>
                </div>
                <button 
                  onClick={() => {
                    setSelectedImageForRefinement(null);
                    setRefinementFeedback('');
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10 relative group">
                <motion.div 
                  className="absolute inset-0 z-0"
                  animate={{
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <motion.img 
                    src={selectedImageForRefinement} 
                    alt="Original Concept" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.2 }}
                  />
                </motion.div>
                
                {/* Bloom */}
                <motion.div 
                  className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
                  animate={{
                    opacity: [0, 0.2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    Quick Suggestions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['More natural stone', 'Modern glass', 'Sunset lighting', 'Larger windows', 'Add a pool', 'Change materials'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setRefinementFeedback(prev => prev ? `${prev}, ${suggestion}` : suggestion)}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    What would you like to adjust?
                  </label>
                  <textarea 
                    value={refinementFeedback}
                    onChange={(e) => setRefinementFeedback(e.target.value)}
                    placeholder="e.g., Add more natural stone, make the roof steeper, or change the lighting to early morning..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all h-32 resize-none"
                  />
                  <button 
                    onClick={handleRefineImage}
                    disabled={isRefining || !refinementFeedback.trim()}
                    className="w-full py-4 bg-white text-black rounded-full font-medium flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    {isRefining ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {isRefining ? 'Refining Concept...' : 'Regenerate with Feedback'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />

      {/* Loading Overlays */}
      <AnimatePresence>
        {(isGeneratingImages || isRefining || isGeneratingVariation || isGeneratingMoodBoard || isGeneratingFloorPlan || isSearchingNeighborhood || isSearchingProperties || isSubmittingContact || (isTyping && step === 'INSIGHTS')) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
          >
            <div className="max-w-md w-full text-center">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-serif text-white mb-4">
                {isGeneratingFloorPlan ? 'Generating Spatial Layout...' : 
                 isGeneratingMoodBoard ? 'Curating Mood Board...' : 
                 isRefining ? 'Refining Concept...' : 
                 isSearchingNeighborhood ? 'Analyzing Neighborhood Data...' :
                 isSearchingProperties ? 'Searching Real Estate...' :
                 isSubmittingContact ? 'Sending Request...' :
                 isGeneratingVariation !== null ? 'Creating Variation...' :
                 (isTyping && step === 'INSIGHTS') ? 'Synthesizing Project Brief...' :
                 'Generating Property Concepts...'}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed uppercase tracking-[0.2em]">
                {isGeneratingFloorPlan ? 'Analyzing brief to optimize room flow and spatial efficiency' :
                 isSearchingNeighborhood ? 'Cross-referencing community data and local market trends' :
                 isSearchingProperties ? 'Scanning listings and matching properties' :
                 (isTyping && step === 'INSIGHTS') ? 'Our AI is analyzing neighborhood dynamics and community features' :
                 'Our AI concierge is synthesizing your preferences into a cohesive vision'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    )}
    </React.Fragment>
  );
}
