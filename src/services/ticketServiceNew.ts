import { db, timestamp } from './firebase';
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
        createdAt: timestamp.fromDate(ticket.createdAt),
        updatedAt: timestamp.fromDate(ticket.updatedAt),
        expiresAt: timestamp.fromDate(ticket.expiresAt),
        match: {
          ...ticket.match,
          date: timestamp.fromDate(ticket.match.date),
        },
      };

      const docRef = await db.collection(this.COLLECTION_NAME).add(ticketForFirebase);
      
      console.log('✅ TicketService - Ticket créé:', docRef.id);

      const createdTicket: Ticket = {
        ...ticket,
        id: docRef.id,
      };

      return { success: true, ticket: createdTicket };
    } catch (error: any) {
      console.error('❌ TicketService - Erreur création:', error);
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

      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

  const tickets: Ticket[] = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
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

      const snapshot = await db
        .collection(this.COLLECTION_NAME)
  .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(50) // Limite pour les performances
        .get();

  const tickets: Ticket[] = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
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
        error: 'Erreur lors de la récupération des tickets' 
      };
    }
  }

  static async getTicketById(ticketId: string): Promise<TicketResult> {
    try {
      console.log('🎫 TicketService - Récupération ticket:', ticketId);

      const doc = await db.collection(this.COLLECTION_NAME).doc(ticketId).get();
      
      if (!doc.exists) {
        return { success: false, error: 'Ticket non trouvé' };
      }

      const data = doc.data()!;
      const ticket: Ticket = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        expiresAt: data.expiresAt.toDate(),
        match: {
          ...data.match,
          date: data.match.date.toDate(),
        },
      } as Ticket;

      console.log('✅ TicketService - Ticket récupéré:', ticket.title);
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

      console.log('🎫 TicketService - Mise à jour statut:', { ticketId, status });

      await db.collection(this.COLLECTION_NAME).doc(ticketId).update({
        status,
        updatedAt: timestamp.now(),
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

      // Vérifier que l'utilisateur est propriétaire du ticket
      const ticketResult = await this.getTicketById(ticketId);
      if (!ticketResult.success || !ticketResult.ticket) {
        return { success: false, error: 'Ticket non trouvé' };
      }

      if (ticketResult.ticket.userId !== currentUser.uid) {
        return { success: false, error: 'Vous ne pouvez supprimer que vos propres tickets' };
      }

      await db.collection(this.COLLECTION_NAME).doc(ticketId).delete();
      
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
  static validateSeat(seat: Seat): boolean {
    return !!(seat.number && seat.row && seat.section);
  }

  static validateMatch(match: Match): boolean {
    return !!(match.awayTeam && match.homeTeam && match.competition && match.stadium && match.date);
  }

  static isTicketExpired(ticket: Ticket): boolean {
    return new Date() > ticket.expiresAt;
  }

  static formatSeat(seat: Seat): string {
    return `Section ${seat.section}, Rangée ${seat.row}, Place ${seat.number}`;
  }

  static formatMatch(match: Match): string {
    return `${match.homeTeam} vs ${match.awayTeam} - ${match.competition}`;
  }
}
