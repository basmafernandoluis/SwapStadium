// Types pour le système de billets SwapStadium
export interface Ticket {
  id: string;
  title: string;
  matchDate: string;
  stadium: string;
  section: string;
  row?: string;
  seat?: string;
  originalPrice: string;
  category: TicketCategory;
  description?: string;
  userId: string;
  userName: string;
  userRating?: number;
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
  images?: string[];
  verified?: boolean;
}

export type TicketCategory = 
  | 'Ligue 1'
  | 'Champions League'
  | 'Europa League'
  | 'Coupe de France'
  | 'Amical'
  | 'International';

export type TicketStatus = 
  | 'available'
  | 'reserved'
  | 'exchanged'
  | 'expired'
  | 'under_review';

export interface TicketFormData {
  title: string;
  matchDate: string;
  stadium: string;
  section: string;
  row: string;
  seat: string;
  originalPrice: string;
  description: string;
  category: TicketCategory;
}

export interface TicketFilters {
  searchQuery: string;
  category: TicketCategory | 'all';
  priceRange: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  stadium: string;
}

export interface ExchangeRequest {
  id: string;
  fromTicketId: string;
  toTicketId: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: ExchangeStatus;
  createdAt: string;
  updatedAt: string;
}

export type ExchangeStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  rating: number;
  totalExchanges: number;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  createdAt: string;
  lastActive: string;
  preferredStadiums: string[];
  favoriteTeams: string[];
}

export interface TicketSearchResult {
  tickets: Ticket[];
  totalCount: number;
  hasMore: boolean;
}

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Utility types pour Firestore
export interface TicketFirestore extends Omit<Ticket, 'createdAt' | 'updatedAt'> {
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface ExchangeRequestFirestore extends Omit<ExchangeRequest, 'createdAt' | 'updatedAt'> {
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// Navigation types
export type TicketStackParamList = {
  TicketList: undefined;
  TicketAdd: undefined;
  TicketDetail: { ticketId: string };
  TicketEdit: { ticketId: string };
  TicketSearch: undefined;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}
