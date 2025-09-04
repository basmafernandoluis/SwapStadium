#!/bin/bash

# 🚀 Script de build et déploiement SwapStadium
# Usage: ./build.sh [development|preview|production] [android|ios|all]

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des paramètres
PROFILE=${1:-production}
PLATFORM=${2:-all}

if [[ ! "$PROFILE" =~ ^(development|preview|production)$ ]]; then
    log_error "Profile invalide. Utilisez: development, preview, ou production"
    exit 1
fi

if [[ ! "$PLATFORM" =~ ^(android|ios|all)$ ]]; then
    log_error "Platform invalide. Utilisez: android, ios, ou all"
    exit 1
fi

log_info "Démarrage du build SwapStadium"
log_info "Profile: $PROFILE"
log_info "Platform: $PLATFORM"

# Vérification des prérequis
check_requirements() {
    log_info "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Expo CLI
    if ! command -v expo &> /dev/null; then
        log_error "Expo CLI n'est pas installé. Exécutez: npm install -g @expo/cli"
        exit 1
    fi
    
    # EAS CLI
    if ! command -v eas &> /dev/null; then
        log_error "EAS CLI n'est pas installé. Exécutez: npm install -g @expo/eas-cli"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    npm install
    npx expo install --fix
    log_success "Dépendances installées"
}

# Mise à jour de la version
update_version() {
    if [[ "$PROFILE" == "production" ]]; then
        log_info "Mise à jour de la version..."
        
        # Lire la version actuelle
        CURRENT_VERSION=$(node -p "require('./app.json').expo.version")
        log_info "Version actuelle: $CURRENT_VERSION"
        
        read -p "Nouvelle version (ou Entrée pour conserver): " NEW_VERSION
        
        if [[ -n "$NEW_VERSION" ]]; then
            # Mise à jour app.json
            node -e "
                const fs = require('fs');
                const app = JSON.parse(fs.readFileSync('app.json'));
                app.expo.version = '$NEW_VERSION';
                
                // Incrémenter buildNumber et versionCode
                if (app.expo.ios) {
                    app.expo.ios.buildNumber = String(parseInt(app.expo.ios.buildNumber || '1') + 1);
                }
                if (app.expo.android) {
                    app.expo.android.versionCode = parseInt(app.expo.android.versionCode || 1) + 1;
                }
                
                fs.writeFileSync('app.json', JSON.stringify(app, null, 2));
            "
            log_success "Version mise à jour: $NEW_VERSION"
        fi
    fi
}

# Validation du code
validate_code() {
    log_info "Validation du code..."
    
    # TypeScript check
    if command -v tsc &> /dev/null; then
        npx tsc --noEmit
        log_success "TypeScript validé"
    fi
    
    # Tests (si disponibles)
    if [[ -f "package.json" ]] && grep -q "\"test\"" package.json; then
        npm test -- --passWithNoTests
        log_success "Tests passés"
    fi
}

# Configuration EAS
setup_eas() {
    log_info "Configuration EAS..."
    
    if [[ ! -f "eas.json" ]]; then
        eas build:configure
        log_success "EAS configuré"
    else
        log_info "EAS déjà configuré"
    fi
}

# Build de l'application
build_app() {
    log_info "Démarrage du build..."
    
    case $PLATFORM in
        "android")
            eas build --platform android --profile $PROFILE --non-interactive
            ;;
        "ios")
            eas build --platform ios --profile $PROFILE --non-interactive
            ;;
        "all")
            eas build --platform all --profile $PROFILE --non-interactive
            ;;
    esac
    
    log_success "Build terminé"
}

# Soumission aux stores (production uniquement)
submit_to_stores() {
    if [[ "$PROFILE" == "production" ]]; then
        read -p "Soumettre aux stores ? (y/N): " SUBMIT
        
        if [[ "$SUBMIT" == "y" || "$SUBMIT" == "Y" ]]; then
            log_info "Soumission aux stores..."
            
            case $PLATFORM in
                "android")
                    eas submit --platform android --non-interactive
                    ;;
                "ios")
                    eas submit --platform ios --non-interactive
                    ;;
                "all")
                    eas submit --platform all --non-interactive
                    ;;
            esac
            
            log_success "Soumission terminée"
        fi
    fi
}

# Génération du changelog
generate_changelog() {
    if [[ "$PROFILE" == "production" ]]; then
        log_info "Génération du changelog..."
        
        CHANGELOG_FILE="CHANGELOG.md"
        VERSION=$(node -p "require('./app.json').expo.version")
        DATE=$(date +"%Y-%m-%d")
        
        # Backup du changelog existant
        if [[ -f "$CHANGELOG_FILE" ]]; then
            cp "$CHANGELOG_FILE" "${CHANGELOG_FILE}.bak"
        fi
        
        # Créer le nouveau changelog
        cat > "$CHANGELOG_FILE" << EOF
# Changelog SwapStadium

## [${VERSION}] - ${DATE}

### 🚀 Nouveautés
- 

### 🐛 Corrections
- 

### 🔧 Améliorations techniques
- Build automatique v${VERSION}

---

$(cat ${CHANGELOG_FILE}.bak 2>/dev/null || echo "")
EOF
        
        log_success "Changelog généré"
        log_info "Éditez $CHANGELOG_FILE pour ajouter les détails"
    fi
}

# Notification de fin
notify_completion() {
    log_success "🎉 Build terminé avec succès !"
    
    if [[ "$PROFILE" == "production" ]]; then
        log_info "📱 Prochaines étapes:"
        echo "1. Vérifiez les builds dans Expo Dashboard"
        echo "2. Testez sur device physique"
        echo "3. Préparez les assets stores si nécessaire"
        echo "4. Surveillez les métriques post-déploiement"
    else
        log_info "🧪 Build de test créé"
        echo "1. Téléchargez et testez l'application"
        echo "2. Vérifiez toutes les fonctionnalités"
        echo "3. Collectez les feedbacks"
    fi
}

# Fonction principale
main() {
    echo "🏟️  SwapStadium Build Script"
    echo "=========================="
    
    check_requirements
    install_dependencies
    update_version
    validate_code
    setup_eas
    build_app
    submit_to_stores
    generate_changelog
    notify_completion
}

# Gestion des erreurs
trap 'log_error "Build échoué à la ligne $LINENO"' ERR

# Exécution
main "$@"
