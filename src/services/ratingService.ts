import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  average,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Rating } from '../types';

export class RatingService {
  private static readonly COLLECTION_NAME = 'ratings';
  
  static async createRating(
    exchangeId: string,
    raterId: string,
    ratedUserId: string,
    rating: number,
    comment?: string
  ): Promise<string> {
    try {
      // Vérifier que l'utilisateur n'a pas déjà noté cet échange
      const existingRating = await this.getRatingForExchange(exchangeId, raterId);
      if (existingRating) {
        throw new Error('Vous avez déjà noté cet échange');
      }
      
      const ratingData: Omit<Rating, 'id'> = {
        exchangeId,
        raterId,
        ratedUserId,
        rating,
        comment,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), ratingData);
      
      // Mettre à jour la note moyenne de l'utilisateur
      await this.updateUserAverageRating(ratedUserId);
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la notation:', error);
      throw error;
    }
  }
  
  static async getUserRatings(userId: string): Promise<Rating[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('ratedUserId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const ratings: Rating[] = [];
      
      snapshot.forEach(doc => {
        ratings.push({ id: doc.id, ...doc.data() } as Rating);
      });
      
      return ratings;
    } catch (error) {
      console.error('Erreur lors de la récupération des notations:', error);
      throw error;
    }
  }
  
  static async getRatingForExchange(exchangeId: string, raterId: string): Promise<Rating | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('exchangeId', '==', exchangeId),
        where('raterId', '==', raterId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Rating;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la notation:', error);
      throw error;
    }
  }
  
  static async calculateUserAverageRating(userId: string): Promise<number> {
    try {
      const ratings = await this.getUserRatings(userId);
      
      if (ratings.length === 0) {
        return 0;
      }
      
      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      return Math.round((sum / ratings.length) * 10) / 10; // Arrondir à 1 décimale
    } catch (error) {
      console.error('Erreur lors du calcul de la note moyenne:', error);
      return 0;
    }
  }
  
  private static async updateUserAverageRating(userId: string): Promise<void> {
    try {
      const averageRating = await this.calculateUserAverageRating(userId);
      const ratings = await this.getUserRatings(userId);
      
      // Importer le service d'authentification pour mettre à jour le profil
      const { AuthService } = await import('./authService');
      
      await AuthService.updateUserProfile(userId, {
        rating: averageRating,
        totalExchanges: ratings.length
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note moyenne:', error);
    }
  }
  
  static async canUserRate(exchangeId: string, userId: string): Promise<boolean> {
    try {
      // Vérifier que l'échange existe et est terminé
      const { ExchangeService } = await import('./exchangeService');
      const exchange = await ExchangeService.getExchangeById(exchangeId);
      
      if (!exchange || exchange.status !== 'completed') {
        return false;
      }
      
      // Vérifier que l'utilisateur fait partie de l'échange
      if (exchange.initiatorId !== userId && exchange.targetId !== userId) {
        return false;
      }
      
      // Vérifier que l'utilisateur n'a pas déjà noté
      const existingRating = await this.getRatingForExchange(exchangeId, userId);
      return !existingRating;
    } catch (error) {
      console.error('Erreur lors de la vérification des droits de notation:', error);
      return false;
    }
  }
}
