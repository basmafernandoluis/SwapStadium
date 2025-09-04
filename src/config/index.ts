// Configuration de l'application
export const config = {
  // Mode développement - active les liens de test
  isDevelopment: __DEV__, // true en mode debug, false en production
  
  // Configuration Firebase
  firebase: {
    maxRetries: 3,
    timeout: 10000
  },
  
  // Configuration des billets
  tickets: {
    maxImagesPerTicket: 5,
    maxDescriptionLength: 500,
    defaultExpirationDays: 30
  },
  
  // Configuration de la pagination
  pagination: {
    pageSize: 10,
    maxCachedPages: 5
  }
};
