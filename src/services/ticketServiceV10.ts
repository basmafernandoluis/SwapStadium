// Firebase v10 - API modulaire
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  getDoc,
  updateDoc,
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { AuthService } from './authService';

// Types basés sur la structure Firebase fournie
export interface Seat {
  number: number;
  row: string;
  section: string;
}

export interface Match {
  awayTeam: string;
  competition: string;
  date: Date;
  homeTeam: string;
  stadium: string;
}

export interface Ticket {
  id?: string;
  category: string;
  createdAt: Date;
  currentSeat: Seat;
  description: string;
  desiredSeat: Seat;
  expiresAt: Date;
  images: string[]; // URLs des images
  match: Match;
  preferences: string[];
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  title: string;
  updatedAt: Date;
  userId: string;
  userName: string;
  userRating: number;
}

export interface CreateTicketData {
  category: string;
  currentSeat: Seat;
  description: string;
  desiredSeat: Seat;
  expiresAt: Date;
  images?: string[];
  match: Match;
  preferences?: string[];
  title: string;
}

export interface TicketResult {
  success: boolean;
  ticket?: Ticket;
  tickets?: Ticket[];
  error?: string;
}

export class TicketService {
  private static readonly COLLECTION_NAME = 'tickets';

  static async createTicket(ticketData: CreateTicketData): Promise<TicketResult> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      console.log('🎫 TicketService - Création ticket:', ticketData.title);

      const now = new Date();
      const ticket: Omit<Ticket, 'id'> = {
        ...ticketData,
        createdAt: now,
        updatedAt: now,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userRating: 5.0, // Rating par défaut
        status: 'active',
        images: ticketData.images || [],
        preferences: ticketData.preferences || [],
      };

      // Conversion des dates en Timestamp Firebase
      const ticketForFirebase = {
        ...ticket,
        createdAt: Timestamp.fromDate(ticket.createdAt),
        updatedAt: Timestamp.fromDate(ticket.updatedAt),
        expiresAt: Timestamp.fromDate(ticket.expiresAt),
        match: {
          ...ticket.match,
          date: Timestamp.fromDate(ticket.match.date),
        },
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), ticketForFirebase);
      
      console.log('✅ TicketService - Ticket créé:', docRef.id);

      const createdTicket: Ticket = {
        ...ticket,
        id: docRef.id,
      };

      return { success: true, ticket: createdTicket };
    } catch (error: any) {
      console.error('❌ TicketService - Erreur création ticket:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la création du ticket' 
      };
    }
  }

  static async getMyTickets(): Promise<TicketResult> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      console.log('🎫 TicketService - Récupération tickets utilisateur');

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

    const tickets: Ticket[] = snapshot.docs.map((docSnapshot: any) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
      category: data.category,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
          match: {
            ...data.match,
            date: data.match.date.toDate(),
          },
        } as Ticket;
      });

      console.log('✅ TicketService - Tickets récupérés:', tickets.length);
      return { success: true, tickets };
    } catch (error: any) {
      console.error('❌ TicketService - Erreur récupération:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des tickets' 
      };
    }
  }

  static async getAllActiveTickets(): Promise<TicketResult> {
    try {
      console.log('🎫 TicketService - Récupération tous les tickets actifs');

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

    const tickets: Ticket[] = snapshot.docs.map((docSnapshot: any) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
      category: data.category,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
          match: {
            ...data.match,
            date: data.match.date.toDate(),
          },
        } as Ticket;
      });

      console.log('✅ TicketService - Tickets actifs récupérés:', tickets.length);
      return { success: true, tickets };
    } catch (error: any) {
      console.error('❌ TicketService - Erreur récupération tickets actifs:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des tickets actifs' 
      };
    }
  }

  static async getTicket(ticketId: string): Promise<TicketResult> {
    try {
      console.log('🎫 TicketService - Récupération ticket:', ticketId);

      const docRef = doc(db, this.COLLECTION_NAME, ticketId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        return { success: false, error: 'Ticket introuvable' };
      }

      const data = docSnapshot.data();
      const ticket: Ticket = {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        expiresAt: data.expiresAt.toDate(),
        match: {
          ...data.match,
          date: data.match.date.toDate(),
        },
      } as Ticket;

      console.log('✅ TicketService - Ticket récupéré');
      return { success: true, ticket };
    } catch (error: any) {
      console.error('❌ TicketService - Erreur récupération ticket:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la récupération du ticket' 
      };
    }
  }

  static async updateTicketStatus(ticketId: string, status: Ticket['status']): Promise<TicketResult> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      console.log('🎫 TicketService - Mise à jour statut:', ticketId, status);

      const docRef = doc(db, this.COLLECTION_NAME, ticketId);
      
      await updateDoc(docRef, {
        status: status,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      console.log('✅ TicketService - Statut mis à jour');
      return { success: true };
    } catch (error: any) {
      console.error('❌ TicketService - Erreur mise à jour:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour du ticket' 
      };
    }
  }

  static async deleteTicket(ticketId: string): Promise<TicketResult> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      console.log('🎫 TicketService - Suppression ticket:', ticketId);

      const docRef = doc(db, this.COLLECTION_NAME, ticketId);
      await deleteDoc(docRef);

      console.log('✅ TicketService - Ticket supprimé');
      return { success: true };
    } catch (error: any) {
      console.error('❌ TicketService - Erreur suppression:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la suppression du ticket' 
      };
    }
  }

  // Méthodes utilitaires
  static validateTicketData(data: CreateTicketData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Le titre est requis');
    }

    if (!data.description?.trim()) {
      errors.push('La description est requise');
    }

    if (!data.category?.trim()) {
      errors.push('La catégorie est requise');
    }

    if (!data.expiresAt || data.expiresAt <= new Date()) {
      errors.push('La date d\'expiration doit être dans le futur');
    }

    if (!data.match?.date || data.match.date <= new Date()) {
      errors.push('La date du match doit être dans le futur');
    }

    if (!data.currentSeat?.number || !data.currentSeat?.row || !data.currentSeat?.section) {
      errors.push('Les informations du siège actuel sont incomplètes');
    }

    if (!data.desiredSeat?.number || !data.desiredSeat?.row || !data.desiredSeat?.section) {
      errors.push('Les informations du siège désiré sont incomplètes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatTicketPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}
