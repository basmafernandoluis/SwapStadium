import firebase from 'firebase/app';
import { firestore } from './firebase';
import { AuthService } from './authService';
import { TicketService } from './ticketService';

// Types d'échange
export type ExchangeRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface ExchangeRequest {
	id?: string;
	fromTicketId: string;
	toTicketId: string;
	fromUserId: string;
	toUserId: string;
	message?: string;
	status: ExchangeRequestStatus;
	createdAt: Date;
	updatedAt: Date;
	fromContactRequested?: boolean;
	toContactRequested?: boolean;
	fromContactShared?: boolean;
	toContactShared?: boolean;
	fromContact?: { emailMasked?: string; phoneMasked?: string } | null;
	toContact?: { emailMasked?: string; phoneMasked?: string } | null;
}

export interface ExchangeRequestResult {
	success: boolean;
	request?: ExchangeRequest;
	requests?: ExchangeRequest[];
	error?: string;
}

export class ExchangeService {
	private static readonly COLLECTION = 'exchangeRequests';

	// Trouver une demande existante entre 2 tickets (dans un état encore actif)
	static async findOpenRequest(fromTicketId: string, toTicketId: string): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
			// On cherche une demande dans un statut non terminal
			const snapshot = await firestore.collection(this.COLLECTION)
				.where('fromTicketId', '==', fromTicketId)
				.where('toTicketId', '==', toTicketId)
				.get();
			const active = snapshot.docs
				.map(d => this.mapDoc(d))
				.find(r => ['pending','accepted'].includes(r.status));
			if (active) return { success: true, request: active };
			return { success: false, error: 'Aucune demande active' };
		} catch (e) {
			console.error('❌ ExchangeService - Erreur findOpenRequest:', e);
			return { success: false, error: 'Erreur recherche demande' };
		}
	}

	// Création d'une demande d'échange
	static async createRequest(fromTicketId: string, toTicketId: string, message?: string): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };

			if (fromTicketId === toTicketId) {
				return { success: false, error: 'Billets identiques' };
			}

			// Récupération des tickets pour validation (existence + propriété)
			const fromTicketRes = await TicketService.getTicket(fromTicketId);
			const toTicketRes = await TicketService.getTicket(toTicketId);
			if (!fromTicketRes.success || !fromTicketRes.ticket) return { success: false, error: 'Ticket source introuvable' };
			if (!toTicketRes.success || !toTicketRes.ticket) return { success: false, error: 'Ticket cible introuvable' };

			const fromTicket = fromTicketRes.ticket;
			const toTicket = toTicketRes.ticket;

			if (fromTicket.userId !== currentUser.uid) {
				return { success: false, error: 'Vous ne possédez pas le ticket source' };
			}

			if (toTicket.userId === currentUser.uid) {
				return { success: false, error: 'Vous possédez déjà ce ticket' };
			}

			if (fromTicket.status !== 'active' || toTicket.status !== 'active') {
				return { success: false, error: 'Les deux tickets doivent être actifs' };
			}

			// Vérifier l'existence d'une demande en attente identique
			const existing = await firestore.collection(this.COLLECTION)
				.where('fromTicketId', '==', fromTicketId)
				.where('toTicketId', '==', toTicketId)
				.where('status', '==', 'pending')
				.get();
			if (!existing.empty) {
				return { success: false, error: 'Une demande déjà en attente entre ces tickets' };
			}

			const now = new Date();
			const request: Omit<ExchangeRequest, 'id'> = {
				fromTicketId,
				toTicketId,
				fromUserId: fromTicket.userId,
				toUserId: toTicket.userId,
				message: message?.trim() || '',
				status: 'pending',
				createdAt: now,
				updatedAt: now,
				fromContactRequested: false,
				toContactRequested: false,
				fromContactShared: false,
				toContactShared: false,
				fromContact: null,
				toContact: null,
			};

			const dataForFirestore = {
				...request,
				createdAt: firebase.firestore.Timestamp.fromDate(request.createdAt),
				updatedAt: firebase.firestore.Timestamp.fromDate(request.updatedAt),
			};

			const docRef = await firestore.collection(this.COLLECTION).add(dataForFirestore);
			return { success: true, request: { ...request, id: docRef.id } };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur création demande:', error);
			return { success: false, error: 'Erreur création demande échange' };
		}
	}

	static async listIncoming(): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };

			let snapshot = await firestore.collection(this.COLLECTION)
				.where('toUserId', '==', currentUser.uid)
				.orderBy('createdAt', 'desc')
				.get();
			const requests = snapshot.docs.map(d => this.mapDoc(d));
			return { success: true, requests };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur liste entrantes:', error);
			return { success: false, error: 'Erreur récupération demandes' };
		}
	}

	static async listOutgoing(): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
			const snapshot = await firestore.collection(this.COLLECTION)
				.where('fromUserId', '==', currentUser.uid)
				.orderBy('createdAt', 'desc')
				.get();
			const requests = snapshot.docs.map(d => this.mapDoc(d));
			return { success: true, requests };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur liste sortantes:', error);
			return { success: false, error: 'Erreur récupération demandes' };
		}
	}

	static async accept(requestId: string): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };

			const reqRef = firestore.collection(this.COLLECTION).doc(requestId);
			const result = await firestore.runTransaction(async (tx) => {
				const reqSnap = await tx.get(reqRef);
				if (!reqSnap.exists) throw new Error('Demande introuvable');
				const data: any = reqSnap.data();
				if (data.toUserId !== currentUser.uid) throw new Error('Non autorisé');
				if (data.status !== 'pending') throw new Error('Statut invalide');

				// Mettre les tickets à jour (statut completed)
				const fromTicketRef = firestore.collection('tickets').doc(data.fromTicketId);
				const toTicketRef = firestore.collection('tickets').doc(data.toTicketId);

				tx.update(fromTicketRef, { status: 'completed', updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });
				tx.update(toTicketRef, { status: 'completed', updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });

				tx.update(reqRef, { status: 'completed', updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });
				return { id: reqSnap.id, ...data, status: 'completed' };
			});

			return { success: true, request: this.mapRaw(result) };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur acceptation:', error);
			return { success: false, error: (error as any)?.message || 'Erreur acceptation' };
		}
	}

	static async reject(requestId: string): Promise<ExchangeRequestResult> {
		return this.updateStatus(requestId, 'rejected');
	}

	static async cancel(requestId: string): Promise<ExchangeRequestResult> {
		return this.updateStatus(requestId, 'cancelled');
	}

	private static async updateStatus(requestId: string, status: ExchangeRequestStatus): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
			const reqRef = firestore.collection(this.COLLECTION).doc(requestId);
			const snap = await reqRef.get();
			if (!snap.exists) return { success: false, error: 'Demande introuvable' };
			const data: any = snap.data();
			if (data.fromUserId !== currentUser.uid && data.toUserId !== currentUser.uid) {
				return { success: false, error: 'Non autorisé' };
			}
			if (data.status !== 'pending') return { success: false, error: 'Statut non modifiable' };
			await reqRef.update({ status, updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });
			return { success: true, request: this.mapDoc(await reqRef.get()) };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur update statut:', error);
			return { success: false, error: 'Erreur mise à jour statut' };
		}
	}

	static async getById(requestId: string): Promise<ExchangeRequestResult> {
		try {
			const snap = await firestore.collection(this.COLLECTION).doc(requestId).get();
			if (!snap.exists) return { success: false, error: 'Demande introuvable' };
			return { success: true, request: this.mapDoc(snap) };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur récupération:', error);
			return { success: false, error: 'Erreur récupération demande' };
		}
	}

	// --- Ajout fonctionnalités contact ---
	static async requestContact(requestId: string): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
			const reqRef = firestore.collection(this.COLLECTION).doc(requestId);
			const snap = await reqRef.get();
			if (!snap.exists) return { success: false, error: 'Demande introuvable' };
			const data: any = snap.data();
			if (data.status !== 'pending') return { success: false, error: 'Statut invalide' };
			if (data.fromUserId !== currentUser.uid && data.toUserId !== currentUser.uid) return { success: false, error: 'Non autorisé' };
			const isFrom = data.fromUserId === currentUser.uid;
			await reqRef.update({
				[isFrom ? 'fromContactRequested' : 'toContactRequested']: true,
				updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
			});
			return { success: true, request: this.mapDoc(await reqRef.get()) };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur requestContact:', error);
			return { success: false, error: 'Erreur demande contact' };
		}
	}

	static async shareContact(requestId: string, contact: { email?: string; phone?: string }): Promise<ExchangeRequestResult> {
		try {
			const currentUser = AuthService.getCurrentUser();
			if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
			const reqRef = firestore.collection(this.COLLECTION).doc(requestId);
			const snap = await reqRef.get();
			if (!snap.exists) return { success: false, error: 'Demande introuvable' };
			const data: any = snap.data();
			if (data.fromUserId !== currentUser.uid && data.toUserId !== currentUser.uid) return { success: false, error: 'Non autorisé' };
			const mask = (v?: string) => v ? v.replace(/(.{3}).+(@?)/,'$1***$2') : undefined;
			const masked = { emailMasked: mask(contact.email), phoneMasked: mask(contact.phone) };
			const isFrom = data.fromUserId === currentUser.uid;
			await reqRef.update({
				[isFrom ? 'fromContactShared' : 'toContactShared']: true,
				[isFrom ? 'fromContact' : 'toContact']: masked,
				updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
			});
			return { success: true, request: this.mapDoc(await reqRef.get()) };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur shareContact:', error);
			return { success: false, error: 'Erreur partage contact' };
		}
	}

	private static mapDoc(doc: firebase.firestore.DocumentSnapshot): ExchangeRequest {
		const data: any = doc.data();
		return {
			id: doc.id,
			fromTicketId: data.fromTicketId,
			toTicketId: data.toTicketId,
			fromUserId: data.fromUserId,
			toUserId: data.toUserId,
			message: data.message,
			status: data.status,
			createdAt: data.createdAt.toDate(),
			updatedAt: data.updatedAt.toDate(),
			fromContactRequested: data.fromContactRequested || false,
			toContactRequested: data.toContactRequested || false,
			fromContactShared: data.fromContactShared || false,
			toContactShared: data.toContactShared || false,
			fromContact: data.fromContact || null,
			toContact: data.toContact || null,
		};
	}

	private static mapRaw(raw: any): ExchangeRequest {
		return {
			id: raw.id,
			fromTicketId: raw.fromTicketId,
			toTicketId: raw.toTicketId,
			fromUserId: raw.fromUserId,
			toUserId: raw.toUserId,
			message: raw.message,
			status: raw.status,
			createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(raw.createdAt),
			updatedAt: raw.updatedAt?.toDate ? raw.updatedAt.toDate() : new Date(raw.updatedAt),
		};
	}
}

