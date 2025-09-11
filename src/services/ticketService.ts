import firebase from 'firebase/app';
import { firestore } from './firebase';
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
  moderationStatus: 'pending' | 'approved' | 'rejected';
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
        moderationStatus: 'pending',
        status: 'active',
        images: ticketData.images || [],
        preferences: ticketData.preferences || [],
      };

      // Conversion des dates en Timestamp Firebase
      const ticketForFirebase = {
        ...ticket,
        createdAt: firebase.firestore.Timestamp.fromDate(ticket.createdAt),
        updatedAt: firebase.firestore.Timestamp.fromDate(ticket.updatedAt),
        expiresAt: firebase.firestore.Timestamp.fromDate(ticket.expiresAt),
        match: {
          ...ticket.match,
          date: firebase.firestore.Timestamp.fromDate(ticket.match.date),
        },
      };

      const docRef = await firestore.collection(this.COLLECTION_NAME).add(ticketForFirebase);
      
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

      let snapshot: firebase.firestore.QuerySnapshot;
      try {
        snapshot = await firestore.collection(this.COLLECTION_NAME)
          .where('userId', '==', currentUser.uid)
          .orderBy('createdAt', 'desc')
          .get();
      } catch (err: any) {
        if (err?.message?.includes('index') || err?.code === 'failed-precondition') {
          console.warn('⚠️ TicketService - Index manquant pour (userId, createdAt desc). Fallback tri local.');
          // Fallback sans orderBy puis tri local
          snapshot = await firestore.collection(this.COLLECTION_NAME)
            .where('userId', '==', currentUser.uid)
            .get();
          const docsSorted = snapshot.docs.sort((a, b) => {
            const ca = (a.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
            const cb = (b.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
            return cb - ca; // desc
          });
          // Remplacer docs par version triée (créer objet compatible)
          (snapshot as any).docs = docsSorted;
        } else {
          throw err;
        }
      }

      const tickets: Ticket[] = snapshot.docs.map((docSnapshot: firebase.firestore.DocumentSnapshot) => {
        const data = docSnapshot.data();
        if (!data) return null;
        return {
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
      }).filter(Boolean) as Ticket[];

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

      let snapshot: firebase.firestore.QuerySnapshot;
      try {
        snapshot = await firestore.collection(this.COLLECTION_NAME)
          .where('status', '==', 'active')
          .orderBy('createdAt', 'desc')
          .get();
      } catch (err: any) {
        if (err?.message?.includes('index') || err?.code === 'failed-precondition') {
          console.warn('⚠️ TicketService - Index manquant pour (status, createdAt desc). Fallback tri local.');
          snapshot = await firestore.collection(this.COLLECTION_NAME)
            .where('status', '==', 'active')
            .get();
            const docsSorted = snapshot.docs.sort((a, b) => {
              const ca = (a.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
              const cb = (b.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
              return cb - ca; // desc
            });
            (snapshot as any).docs = docsSorted;
        } else {
          throw err;
        }
      }

      const tickets: Ticket[] = snapshot.docs.map((docSnapshot: firebase.firestore.DocumentSnapshot) => {
        const data = docSnapshot.data();
        if (!data) return null;
        return {
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
      }).filter(Boolean) as Ticket[];

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

      const docSnapshot = await firestore.collection(this.COLLECTION_NAME).doc(ticketId).get();

      if (!docSnapshot.exists) {
        return { success: false, error: 'Ticket introuvable' };
      }

      const data = docSnapshot.data();
      if (!data) {
        return { success: false, error: 'Données du ticket introuvables' };
      }

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

      await firestore.collection(this.COLLECTION_NAME).doc(ticketId).update({
        status: status,
        updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
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

      await firestore.collection(this.COLLECTION_NAME).doc(ticketId).delete();

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

  // --- Utilitaires ajoutés (utilisés par les écrans) ---
  static formatSeat(seat: Seat): string {
    if (!seat) return '';
    return `Section ${seat.section}, Rangée ${seat.row}, Place ${seat.number}`;
  }

  static formatMatch(match: Match): string {
    if (!match) return '';
    return `${match.homeTeam} vs ${match.awayTeam} - ${match.competition}`;
  }

  static isTicketExpired(ticket: Ticket): boolean {
    return new Date() > ticket.expiresAt;
  }
}
