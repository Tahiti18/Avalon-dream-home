export type OwnershipStatus = 'buying' | 'investing' | 'exploring';
export type BudgetRange = 'Under $250K' | '$250K–$500K' | '$500K–$750K' | '$750K–$1M' | '$1M+' | 'Custom budget' | string;
export type Timeline = 'Immediately' | '3–6 months' | '6–12 months' | 'Just exploring';
export type PropertyType = 'Move-in ready home' | 'New construction' | 'Prime lot / land' | 'Historic home / renovation opportunity' | 'Investment property' | 'Not sure yet' | string;
export type PropertyStyle = 'Coastal Traditional' | 'Modern Farmhouse' | 'European Manor' | 'Contemporary Glass' | string;
export type LifestylePriority = 'Suburban family living' | 'Golf community' | 'Waterfront / coastal lifestyle' | 'Urban / city convenience' | 'New construction' | 'Land / lot search' | 'Historic charm' | 'Investment potential' | 'More options' | 'Custom lifestyle' | string;

export type SortOption = 'date-newest' | 'date-oldest' | 'budget-low' | 'budget-high';

export interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
}

export interface SavedBrief {
  id: string;
  date: string;
  location: string;
  budgetRange: string;
  propertyType: string;
  styleDirection: string;
  content: string;
  brief?: PropertyBrief;
  milestones?: Milestone[];
  generatedImages?: string[];
  floorPlans?: FloorPlan[];
  neighborhoodInsights?: NeighborhoodInsights | null;
  preferences?: {
    modernity: number;
    sustainability: number;
    luxury: number;
    openness: number;
  };
}

export interface PropertyBrief {
  location?: string;
  ownershipStatus?: OwnershipStatus;
  budgetRange?: BudgetRange;
  timeline?: Timeline;
  propertyType?: PropertyType;
  styleDirection?: string;
  lifestyle?: string;
  features?: string[];
  keyPriorities?: LifestylePriority[];
}

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'garage' | 'other';
}

export interface FloorPlan {
  rooms: Room[];
  totalArea: number;
  description: string;
}

export interface NeighborhoodInsights {
  community: {
    title: string;
    details: string[];
  };
  lifestyle: {
    title: string;
    details: string[];
  };
  market: {
    title: string;
    details: string[];
  };
  recommendations: string[];
}

export type Step = 
  | 'OPENING'
  | 'LOCATION'
  | 'LIFESTYLE'
  | 'BUDGET'
  | 'TIMELINE'
  | 'PROPERTY_TYPE'
  | 'STYLE'
  | 'FEATURES'
  | 'PRIORITIES'
  | 'INSIGHTS'
  | 'BRIEF'
  | 'FLOORPLAN'
  | 'MOODBOARD'
  | 'NEIGHBORHOOD_INSIGHTS'
  | 'VISUAL_INSPIRATION'
  | 'PROPERTY_MATCHING'
  | 'EMOTIONAL_REINFORCEMENT'
  | 'LEAD_CAPTURE';

export interface Message {
  id: string;
  role: 'concierge' | 'user';
  content: string;
  options?: string[];
  images?: string[];
  matchUrl?: string;
}
