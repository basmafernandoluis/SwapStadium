import firebase from 'firebase/app';
import { db, storage, timestamp } from './firebase';
import { Ticket, SearchFilters } from '../types';

export class TicketService {
  private static readonly COLLECTION_NAME = 'tickets';
  private static readonly STORAGE_PATH = 'ticket-images';
  
  // Pagination pour optimiser les coûts
  private static readonly PAGE_SIZE = 10;
  
  static async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ticket = {
        ...ticketData,
        createdAt: new Date(),
        updatedAt: new Date(),
        moderationStatus: 'pending' as const
      };
      
      const docRef = await db.collection(this.COLLECTION_NAME).add(ticket);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du billet:', error);
      throw error;
    }
  }
  
  static async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<void> {
    try {
      await db.collection(this.COLLECTION_NAME).doc(ticketId).update({
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du billet:', error);
      throw error;
    }
  }
  
  static async deleteTicket(ticketId: string): Promise<void> {
    try {
      // Supprimer les images associées
      const ticket = await this.getTicketById(ticketId);
      if (ticket?.images) {
        await Promise.all(
          ticket.images.map(imageUrl => this.deleteImage(imageUrl))
        );
      }
      
      await db.collection(this.COLLECTION_NAME).doc(ticketId).delete();
    } catch (error) {
      console.error('Erreur lors de la suppression du billet:', error);
      throw error;
    }
  }
  
  static async getTicketById(ticketId: string): Promise<Ticket | null> {
    try {
      const docSnap = await db.collection(this.COLLECTION_NAME).doc(ticketId).get();
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Ticket;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du billet:', error);
      throw error;
    }
  }
  
  static async getUserTickets(userId: string, lastDocId?: string): Promise<{
    tickets: Ticket[];
    lastDocId: string | null;
    hasMore: boolean;
  }> {
    try {
      console.log('📋 Chargement des billets utilisateur:', userId);
      
      // Version simplifiée sans index complexes
      let query = db.collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(this.PAGE_SIZE);
      
      if (lastDocId) {
        const lastDoc = await db.collection(this.COLLECTION_NAME).doc(lastDocId).get();
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      const tickets: Ticket[] = [];
      
      snapshot.forEach(doc => {
        tickets.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      
      const newLastDocId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
      const hasMore = snapshot.docs.length === this.PAGE_SIZE;
      
      console.log(`✅ ${tickets.length} billets trouvés pour l'utilisateur`);
      return { tickets, lastDocId: newLastDocId, hasMore };
    } catch (error) {
      console.error('Erreur lors de la récupération des billets utilisateur:', error);
      throw error;
    }
  }
  
  static async searchTickets(
    filters: SearchFilters,
    lastDocId?: string
  ): Promise<{
    tickets: Ticket[];
    lastDocId: string | null;
    hasMore: boolean;
  }> {
    try {
      console.log('🔍 Recherche de billets simplifiée pour le développement...');
      
      // Version simplifiée sans index complexes - développement uniquement
      let query = db.collection(this.COLLECTION_NAME)
        .orderBy('createdAt', 'desc')
        .limit(this.PAGE_SIZE);
      
      if (lastDocId) {
        const lastDoc = await db.collection(this.COLLECTION_NAME).doc(lastDocId).get();
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      const tickets: Ticket[] = [];
      
      snapshot.forEach(doc => {
        const ticketData = { id: doc.id, ...doc.data() } as Ticket;
        
        // Filtrage côté client pour éviter les index
        if (filters.category && ticketData.category !== filters.category) {
          return;
        }
        
        if (filters.stadium && ticketData.match.stadium !== filters.stadium) {
          return;
        }
        
        if (filters.section && ticketData.currentSeat.section !== filters.section) {
          return;
        }
        
        if (filters.match && !ticketData.title.toLowerCase().includes(filters.match.toLowerCase())) {
          return;
        }
        
        if (filters.dateFrom && ticketData.match.date < filters.dateFrom) {
          return;
        }
        
        if (filters.dateTo && ticketData.match.date > filters.dateTo) {
          return;
        }
        
        tickets.push(ticketData);
      });
      
      const newLastDocId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
      const hasMore = snapshot.docs.length === this.PAGE_SIZE;
      
      return { tickets, lastDocId: newLastDocId, hasMore };
    } catch (error) {
      console.error('Erreur lors de la recherche de billets:', error);
      throw error;
    }
  }
  
  static async uploadTicketImage(imageUri: string, ticketId: string, imageIndex: number): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const imageName = `${ticketId}_${imageIndex}_${Date.now()}.jpg`;
      const imageRef = storage.ref(`${this.STORAGE_PATH}/${imageName}`);
      
      await imageRef.put(blob);
      const downloadURL = await imageRef.getDownloadURL();
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw error;
    }
  }
  
  private static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = storage.refFromURL(imageUrl);
      await imageRef.delete();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      // Ne pas faire échouer la suppression du billet si l'image ne peut pas être supprimée
    }
  }
  
  // Fonction pour modération manuelle
  static async getTicketsForModeration(lastDocId?: string): Promise<{
    tickets: Ticket[];
    lastDocId: string | null;
    hasMore: boolean;
  }> {
    try {
      let query = db.collection(this.COLLECTION_NAME)
        .where('moderationStatus', '==', 'pending')
        .orderBy('createdAt', 'asc')
        .limit(this.PAGE_SIZE);
      
      if (lastDocId) {
        const lastDoc = await db.collection(this.COLLECTION_NAME).doc(lastDocId).get();
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      const tickets: Ticket[] = [];
      
      snapshot.forEach(doc => {
        tickets.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      
      const newLastDocId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
      const hasMore = snapshot.docs.length === this.PAGE_SIZE;
      
      return { tickets, lastDocId: newLastDocId, hasMore };
    } catch (error) {
      console.error('Erreur lors de la récupération des billets en attente:', error);
      throw error;
    }
  }
  
  static async moderateTicket(ticketId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await db.collection(this.COLLECTION_NAME).doc(ticketId).update({
        moderationStatus: status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la modération du billet:', error);
      throw error;
    }
  }
}
