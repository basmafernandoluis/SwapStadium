export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  verified: boolean;
  rating: number;
  totalExchanges: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  userRating: number;
  title: string;
  description: string;
  match: {
    homeTeam: string;
    awayTeam: string;
    date: Date;
    stadium: string;
    competition: string;
  };
  currentSeat: {
    section: string;
    row: string;
    number: string;
  };
  desiredSeat?: {
    section: string;
    row?: string;
    number?: string;
  };
  images: string[];
  status: 'active' | 'exchanged' | 'expired' | 'suspended';
  category: 'exchange' | 'giveaway';
  preferences: {
    exchangeType: 'any' | 'specific';
    proximity: 'same_section' | 'same_stand' | 'any';
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  moderationStatus: 'pending' | 'approved' | 'rejected';
}

export interface Exchange {
  id: string;
  initiatorId: string;
  targetId: string;
  initiatorTicketId: string;
  targetTicketId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  messages: ExchangeMessage[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ExchangeMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

export interface Rating {
  id: string;
  exchangeId: string;
  raterId: string;
  ratedUserId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface SearchFilters {
  match?: string;
  stadium?: string;
  section?: string;
  dateFrom?: Date;
  dateTo?: Date;
  category?: 'exchange' | 'giveaway';
  sortBy?: 'date' | 'rating' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'exchange_request' | 'exchange_accepted' | 'exchange_rejected' | 'rating' | 'system';
  data?: any;
  read: boolean;
  createdAt: Date;
}
