// Test rapide des fonctions Firebase
const { execSync } = require('child_process');

console.log('🔍 Test de diagnostic SwapStadium...\n');

try {
  // Vérifier si Firebase est configuré
  console.log('1. Vérification de la configuration Firebase...');
  const configExists = require('fs').existsSync('./src/config/firebase.js');
  console.log(`   Config Firebase existe: ${configExists ? '✅' : '❌'}`);
  
  if (configExists) {
    const firebaseConfig = require('./src/config/firebase.js');
    console.log('   Clés de config présentes:', Object.keys(firebaseConfig.default || firebaseConfig));
  }
  
  // Vérifier la structure des services
  console.log('\n2. Vérification des services...');
  const authServiceExists = require('fs').existsSync('./src/services/authService.ts');
  const ticketServiceExists = require('fs').existsSync('./src/services/ticketService.ts');
  console.log(`   AuthService: ${authServiceExists ? '✅' : '❌'}`);
  console.log(`   TicketService: ${ticketServiceExists ? '✅' : '❌'}`);
  
  // Vérifier les hooks
  console.log('\n3. Vérification des hooks...');
  const useAuthExists = require('fs').existsSync('./src/hooks/useAuth.tsx');
  console.log(`   useAuth hook: ${useAuthExists ? '✅' : '❌'}`);
  
  console.log('\n✅ Diagnostic terminé!');
  
} catch (error) {
  console.error('❌ Erreur lors du diagnostic:', error.message);
}
