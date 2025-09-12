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
	// Optionnel: si le destinataire souhaite choisir un billet spécifique du demandeur
	selectedFromTicketId?: string;
	message?: string;
	status: ExchangeRequestStatus;
	createdAt: Date;
	updatedAt: Date;
	// Confirmation bilatérale de finalisation
	fromCompletedConfirmed?: boolean;
	toCompletedConfirmed?: boolean;
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

	// --- REAL-TIME SUBSCRIPTIONS (ajoutés) ---
	// Retourne une fonction d'unsubscribe
	static subscribeIncoming(callback: (requests: ExchangeRequest[]) => void): () => void {
		const currentUser = AuthService.getCurrentUser();
		if (!currentUser) { callback([]); return () => {}; }
		let baseQuery: firebase.firestore.Query = firestore.collection(this.COLLECTION)
			.where('toUserId', '==', currentUser.uid);
		let unsub: (() => void) | null = null;
		const attachOrdered = () => {
			try {
				unsub = baseQuery.orderBy('createdAt', 'desc').onSnapshot({
					next: (snapshot) => {
						const reqs = snapshot.docs.map(d => this.mapDoc(d));
						callback(reqs);
					},
					error: (err) => {
						if (err?.message?.includes('index')) {
							console.warn('⚠️ ExchangeService.subscribeIncoming - index manquant, fallback sans orderBy');
							if (unsub) { try { unsub(); } catch {} }
							unsub = baseQuery.onSnapshot(snap => {
								const sorted = [...snap.docs].sort((a,b) => {
									const ca = (a.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
									const cb = (b.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
									return cb - ca;
								});
								callback(sorted.map(d => this.mapDoc(d)));
							});
						} else {
							console.error('❌ ExchangeService.subscribeIncoming - erreur snapshot:', err);
							callback([]);
						}
					}
				});
			} catch(e) {
				console.error('❌ ExchangeService.subscribeIncoming - exception attachement:', e);
				callback([]);
			}
		};
		attachOrdered();
		return () => { if (unsub) unsub(); };
	}

	static subscribeOutgoing(callback: (requests: ExchangeRequest[]) => void): () => void {
		const currentUser = AuthService.getCurrentUser();
		if (!currentUser) { callback([]); return () => {}; }
		let baseQuery: firebase.firestore.Query = firestore.collection(this.COLLECTION)
			.where('fromUserId', '==', currentUser.uid);
		let unsub: (() => void) | null = null;
		const attachOrdered = () => {
			try {
				unsub = baseQuery.orderBy('createdAt', 'desc').onSnapshot({
					next: (snapshot) => {
						const reqs = snapshot.docs.map(d => this.mapDoc(d));
						callback(reqs);
					},
					error: (err) => {
						if (err?.message?.includes('index')) {
							console.warn('⚠️ ExchangeService.subscribeOutgoing - index manquant, fallback sans orderBy');
							if (unsub) { try { unsub(); } catch {} }
							unsub = baseQuery.onSnapshot(snap => {
								const sorted = [...snap.docs].sort((a,b) => {
									const ca = (a.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
									const cb = (b.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
									return cb - ca;
								});
								callback(sorted.map(d => this.mapDoc(d)));
							});
						} else {
							console.error('❌ ExchangeService.subscribeOutgoing - erreur snapshot:', err);
							callback([]);
						}
					}
				});
			} catch(e) {
				console.error('❌ ExchangeService.subscribeOutgoing - exception attachement:', e);
				callback([]);
			}
		};
		attachOrdered();
		return () => { if (unsub) unsub(); };
	}

		// S'abonner aux demandes entre deux billets (dans les deux sens) et émettre la plus récente
		static subscribeRequestBetween(
			aTicketId: string,
			bTicketId: string,
			callback: (request: ExchangeRequest | null) => void
		): () => void {
			let latestA: ExchangeRequest | null = null;
			let latestB: ExchangeRequest | null = null;

			const pickAndEmit = () => {
				const pick = (x?: ExchangeRequest | null, y?: ExchangeRequest | null) => {
					if (x && y) {
						const xu = x.updatedAt?.getTime?.() || 0;
						const yu = y.updatedAt?.getTime?.() || 0;
						return xu >= yu ? x : y;
					}
					return x || y || null;
				};
				const chosen = pick(latestA, latestB);
				callback(chosen);
			};

			const baseA = firestore.collection(this.COLLECTION)
				.where('fromTicketId', '==', aTicketId)
				.where('toTicketId', '==', bTicketId);
			const baseB = firestore.collection(this.COLLECTION)
				.where('fromTicketId', '==', bTicketId)
				.where('toTicketId', '==', aTicketId);

			let unsubA: (() => void) | null = null;
			let unsubB: (() => void) | null = null;

			const attach = (
				base: firebase.firestore.Query,
				assign: (req: ExchangeRequest | null) => void,
				label: string
			): (() => void) | null => {
				try {
					return base.orderBy('updatedAt', 'desc').limit(1).onSnapshot({
						next: (snap) => {
							const req = snap.docs.length ? this.mapDoc(snap.docs[0]) : null;
							assign(req);
							pickAndEmit();
						},
						error: (err) => {
							if (err?.message?.includes('index')) {
								console.warn(`⚠️ ExchangeService.subscribeRequestBetween - index manquant (${label}), fallback`);
								const unsub = base.onSnapshot((snap2) => {
									const docs = [...snap2.docs].sort((a,b) => {
										const au = (a.data().updatedAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
										const bu = (b.data().updatedAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
										return bu - au;
									});
									const req = docs.length ? this.mapDoc(docs[0]) : null;
									assign(req);
									pickAndEmit();
								});
								return unsub;
							} else {
								console.error('❌ subscribeRequestBetween error', err);
								assign(null);
								pickAndEmit();
							}
						}
					});
				} catch (e) {
					console.error('❌ subscribeRequestBetween attach exception', e);
					assign(null);
					pickAndEmit();
					return null;
				}
			};

			unsubA = attach(baseA, (r) => { latestA = r; }, 'A->B');
			unsubB = attach(baseB, (r) => { latestB = r; }, 'B->A');

			return () => {
				try { if (unsubA) unsubA(); } catch {}
				try { if (unsubB) unsubB(); } catch {}
			};
		}

		// Trouve une demande active (pending/accepted) dans les deux sens
		static async findOpenRequestBetween(aTicketId: string, bTicketId: string): Promise<ExchangeRequestResult> {
			const first = await this.findOpenRequest(aTicketId, bTicketId);
			if (first.success) return first;
			return this.findOpenRequest(bTicketId, aTicketId);
		}

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
						fromCompletedConfirmed: false,
						toCompletedConfirmed: false,
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

			let snapshot: firebase.firestore.QuerySnapshot;
			try {
				snapshot = await firestore.collection(this.COLLECTION)
					.where('toUserId', '==', currentUser.uid)
					.orderBy('createdAt', 'desc')
					.get();
			} catch (err: any) {
				if (err?.message?.includes('index')) {
					console.warn('⚠️ ExchangeService - Index manquant (toUserId, createdAt desc). Fallback tri local.');
					snapshot = await firestore.collection(this.COLLECTION)
						.where('toUserId', '==', currentUser.uid)
						.get();
					// tri local desc
					const sorted = snapshot.docs.sort((a,b) => {
						const ca = (a.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
						const cb = (b.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
						return cb - ca;
					});
					(snapshot as any).docs = sorted;
				} else {
					throw err;
				}
			}
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
			let snapshot: firebase.firestore.QuerySnapshot;
			try {
				snapshot = await firestore.collection(this.COLLECTION)
					.where('fromUserId', '==', currentUser.uid)
					.orderBy('createdAt', 'desc')
					.get();
			} catch (err: any) {
				if (err?.message?.includes('index')) {
					console.warn('⚠️ ExchangeService - Index manquant (fromUserId, createdAt desc). Fallback tri local.');
					snapshot = await firestore.collection(this.COLLECTION)
						.where('fromUserId', '==', currentUser.uid)
						.get();
					const sorted = snapshot.docs.sort((a,b) => {
						const ca = (a.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
						const cb = (b.data().createdAt as firebase.firestore.Timestamp)?.toMillis?.() || 0;
						return cb - ca;
					});
					(snapshot as any).docs = sorted;
				} else {
					throw err;
				}
			}
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

				// Étape acceptation: seule la demande passe en 'accepted'. Les billets seront mis à jour lors de 'complete()'.
				tx.update(reqRef, { status: 'accepted', updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });
				return { id: reqSnap.id, ...data, status: 'accepted' };
			});

			return { success: true, request: this.mapRaw(result) };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur acceptation:', error);
			return { success: false, error: (error as any)?.message || 'Erreur acceptation' };
		}
	}

	// Variante d'acceptation permettant au destinataire de choisir un billet précis du demandeur
	static async acceptWithSelection(requestId: string, selectedFromTicketId: string): Promise<ExchangeRequestResult> {
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

				// Valider que le ticket sélectionné appartient bien au demandeur et est actif
				const fromTicketRef = firestore.collection('tickets').doc(selectedFromTicketId);
				const fromTicketSnap = await tx.get(fromTicketRef);
				if (!fromTicketSnap.exists) throw new Error('Ticket sélectionné introuvable');
				const fromT: any = fromTicketSnap.data();
				if (fromT.userId !== data.fromUserId) throw new Error('Ticket non valide');
				if (fromT.status !== 'active') throw new Error('Ticket non actif');

				tx.update(reqRef, { status: 'accepted', selectedFromTicketId, updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });
				return { id: reqSnap.id, ...data, status: 'accepted', selectedFromTicketId };
			});

			return { success: true, request: this.mapRaw(result) };
		} catch (error) {
			console.error('❌ ExchangeService - Erreur acceptation avec sélection:', error);
			return { success: false, error: (error as any)?.message || 'Erreur acceptation' };
		}
	}

	static async reject(requestId: string): Promise<ExchangeRequestResult> {
		return this.updateStatus(requestId, 'rejected');
	}

	static async cancel(requestId: string): Promise<ExchangeRequestResult> {
		return this.updateStatus(requestId, 'cancelled');
	}

			// Marque l'échange comme terminé et met fin au cycle: met à jour la demande et les deux billets
			static async complete(requestId: string): Promise<ExchangeRequestResult> {
				try {
					const currentUser = AuthService.getCurrentUser();
					if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };

					const reqRef = firestore.collection(this.COLLECTION).doc(requestId);
					const result = await firestore.runTransaction(async (tx) => {
						const snap = await tx.get(reqRef);
						if (!snap.exists) throw new Error('Demande introuvable');
						const data: any = snap.data();
						if (!data) throw new Error('Données manquantes');
						// Autorisé pour l'une des deux parties
						if (![data.fromUserId, data.toUserId].includes(currentUser.uid)) {
							throw new Error('Non autorisé');
						}
						const nowTs = firebase.firestore.Timestamp.fromDate(new Date());

									// Ancienne sémantique: on finalisait directement. Désormais, on considère cela comme une confirmation unique.
									const isFrom = data.fromUserId === currentUser.uid;
									const newFlags = {
										fromCompletedConfirmed: !!(isFrom ? true : data.fromCompletedConfirmed),
										toCompletedConfirmed: !!(isFrom ? data.toCompletedConfirmed : true)
									};
									// Appliquer le flag de confirmation de l'utilisateur courant
									tx.update(reqRef, { ...newFlags, updatedAt: nowTs });

									// Si les deux ont confirmé, on passe en completed et on met à jour les deux billets
									if (newFlags.fromCompletedConfirmed && newFlags.toCompletedConfirmed) {
										tx.update(reqRef, { status: 'completed', updatedAt: nowTs });
										const effectiveFromId = data.selectedFromTicketId || data.fromTicketId;
										const fromTicketRef = firestore.collection('tickets').doc(effectiveFromId);
										const toTicketRef = firestore.collection('tickets').doc(data.toTicketId);
										tx.update(fromTicketRef, { status: 'completed', updatedAt: nowTs });
										tx.update(toTicketRef, { status: 'completed', updatedAt: nowTs });
										return { id: snap.id, ...data, status: 'completed', updatedAt: nowTs, ...newFlags };
									}

									return { id: snap.id, ...data, updatedAt: nowTs, ...newFlags };
					});

								return { success: true, request: this.mapRaw(result) };
				} catch (error) {
					console.error('❌ ExchangeService - Erreur completion:', error);
					return { success: false, error: (error as any)?.message || 'Erreur finalisation' };
				}
			}

				// Nouvelle méthode: confirme l'échange pour l'utilisateur courant; finalise uniquement si les deux ont confirmé
				static async confirmComplete(requestId: string): Promise<ExchangeRequestResult> {
					try {
						const currentUser = AuthService.getCurrentUser();
						if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
						const reqRef = firestore.collection(this.COLLECTION).doc(requestId);
						const result = await firestore.runTransaction(async (tx) => {
							const snap = await tx.get(reqRef);
							if (!snap.exists) throw new Error('Demande introuvable');
							const data: any = snap.data();
							if (!['accepted'].includes((data.status || '').toLowerCase())) {
								// Si déjà completed, on est idempotent
								if ((data.status || '').toLowerCase() === 'completed') return { id: snap.id, ...data };
								throw new Error('Statut invalide');
							}
							const nowTs = firebase.firestore.Timestamp.fromDate(new Date());
							const isFrom = data.fromUserId === currentUser.uid;
							const flags = {
								fromCompletedConfirmed: !!(isFrom ? true : data.fromCompletedConfirmed),
								toCompletedConfirmed:   !!(isFrom ? data.toCompletedConfirmed : true),
							};
							tx.update(reqRef, { ...flags, updatedAt: nowTs });
							if (flags.fromCompletedConfirmed && flags.toCompletedConfirmed) {
								// Finaliser
								const effectiveFromId = data.selectedFromTicketId || data.fromTicketId;
								const fromTicketRef = firestore.collection('tickets').doc(effectiveFromId);
								const toTicketRef = firestore.collection('tickets').doc(data.toTicketId);
								tx.update(reqRef, { status: 'completed', updatedAt: nowTs });
								tx.update(fromTicketRef, { status: 'completed', updatedAt: nowTs });
								tx.update(toTicketRef, { status: 'completed', updatedAt: nowTs });
								return { id: snap.id, ...data, status: 'completed', ...flags, updatedAt: nowTs };
							}
							return { id: snap.id, ...data, ...flags, updatedAt: nowTs };
						});
						return { success: true, request: this.mapRaw(result) };
					} catch (error) {
						console.error('❌ ExchangeService - Erreur confirmComplete:', error);
						return { success: false, error: (error as any)?.message || 'Erreur de confirmation' };
					}
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
				// Règles: 'pending' -> cancel (fromUser ou toUser) / reject (toUser)
				//         'accepted' -> cancel autorisé par le demandeur (fromUser) uniquement pour refuser le choix
				const currentStatus = (data.status || '').toLowerCase();
				const isFrom = data.fromUserId === currentUser.uid;
				if (currentStatus === 'pending') {
					// ok
				} else if (currentStatus === 'accepted') {
					if (!(status === 'cancelled' && isFrom)) {
						return { success: false, error: 'Statut non modifiable' };
					}
				} else {
					return { success: false, error: 'Statut non modifiable' };
				}
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
			selectedFromTicketId: data.selectedFromTicketId,
			message: data.message,
				status: (data.status || 'pending').toLowerCase(),
			createdAt: data.createdAt.toDate(),
			updatedAt: data.updatedAt.toDate(),
				fromCompletedConfirmed: data.fromCompletedConfirmed || false,
				toCompletedConfirmed: data.toCompletedConfirmed || false,
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
				status: (raw.status || 'pending').toLowerCase(),
			createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(raw.createdAt),
			updatedAt: raw.updatedAt?.toDate ? raw.updatedAt.toDate() : new Date(raw.updatedAt),
				selectedFromTicketId: raw.selectedFromTicketId,
				fromCompletedConfirmed: !!raw.fromCompletedConfirmed,
				toCompletedConfirmed: !!raw.toCompletedConfirmed,
		};
	}
}

