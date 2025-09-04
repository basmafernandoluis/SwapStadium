# 🚀 Script de build et déploiement SwapStadium pour Windows
# Usage: .\build.ps1 [development|preview|production] [android|ios|all]

param(
    [string]$Profile = "production",
    [string]$Platform = "all"
)

# Vérification des paramètres
if ($Profile -notin @("development", "preview", "production")) {
    Write-Host "❌ Profile invalide. Utilisez: development, preview, ou production" -ForegroundColor Red
    exit 1
}

if ($Platform -notin @("android", "ios", "all")) {
    Write-Host "❌ Platform invalide. Utilisez: android, ios, ou all" -ForegroundColor Red
    exit 1
}

# Fonctions utilitaires
function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

Write-Host "🏟️  SwapStadium Build Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Info "Profile: $Profile"
Write-Info "Platform: $Platform"

# Vérification des prérequis
function Test-Requirements {
    Write-Info "Vérification des prérequis..."
    
    # Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js n'est pas installé"
        exit 1
    }
    
    # Expo CLI
    if (-not (Get-Command expo -ErrorAction SilentlyContinue)) {
        Write-Error "Expo CLI n'est pas installé. Exécutez: npm install -g @expo/cli"
        exit 1
    }
    
    # EAS CLI
    if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
        Write-Error "EAS CLI n'est pas installé. Exécutez: npm install -g @expo/eas-cli"
        exit 1
    }
    
    Write-Success "Prérequis vérifiés"
}

# Installation des dépendances
function Install-Dependencies {
    Write-Info "Installation des dépendances..."
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Erreur lors de l'installation npm" }
    
    npx expo install --fix
    if ($LASTEXITCODE -ne 0) { throw "Erreur lors de la mise à jour Expo" }
    
    Write-Success "Dépendances installées"
}

# Mise à jour de la version
function Update-Version {
    if ($Profile -eq "production") {
        Write-Info "Mise à jour de la version..."
        
        # Lire la version actuelle
        $appJson = Get-Content "app.json" | ConvertFrom-Json
        $currentVersion = $appJson.expo.version
        Write-Info "Version actuelle: $currentVersion"
        
        $newVersion = Read-Host "Nouvelle version (ou Entrée pour conserver)"
        
        if ($newVersion) {
            # Mise à jour app.json
            $appJson.expo.version = $newVersion
            
            # Incrémenter buildNumber et versionCode
            if ($appJson.expo.ios) {
                $currentBuild = [int]($appJson.expo.ios.buildNumber -replace '\D', '1')
                $appJson.expo.ios.buildNumber = [string]($currentBuild + 1)
            }
            
            if ($appJson.expo.android) {
                $currentVersionCode = [int]($appJson.expo.android.versionCode -replace '\D', '1')
                $appJson.expo.android.versionCode = $currentVersionCode + 1
            }
            
            $appJson | ConvertTo-Json -Depth 10 | Set-Content "app.json"
            Write-Success "Version mise à jour: $newVersion"
        }
    }
}

# Validation du code
function Test-Code {
    Write-Info "Validation du code..."
    
    # TypeScript check
    if (Get-Command tsc -ErrorAction SilentlyContinue) {
        npx tsc --noEmit
        if ($LASTEXITCODE -eq 0) {
            Write-Success "TypeScript validé"
        }
    }
    
    # Tests (si disponibles)
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        npm test -- --passWithNoTests
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests passés"
        }
    }
}

# Configuration EAS
function Set-EAS {
    Write-Info "Configuration EAS..."
    
    if (-not (Test-Path "eas.json")) {
        eas build:configure
        if ($LASTEXITCODE -eq 0) {
            Write-Success "EAS configuré"
        }
    } else {
        Write-Info "EAS déjà configuré"
    }
}

# Build de l'application
function Build-App {
    Write-Info "Démarrage du build..."
    
    switch ($Platform) {
        "android" {
            eas build --platform android --profile $Profile --non-interactive
        }
        "ios" {
            eas build --platform ios --profile $Profile --non-interactive
        }
        "all" {
            eas build --platform all --profile $Profile --non-interactive
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build terminé"
    } else {
        throw "Erreur lors du build"
    }
}

# Soumission aux stores
function Submit-ToStores {
    if ($Profile -eq "production") {
        $submit = Read-Host "Soumettre aux stores ? (y/N)"
        
        if ($submit -eq "y" -or $submit -eq "Y") {
            Write-Info "Soumission aux stores..."
            
            switch ($Platform) {
                "android" {
                    eas submit --platform android --non-interactive
                }
                "ios" {
                    eas submit --platform ios --non-interactive
                }
                "all" {
                    eas submit --platform all --non-interactive
                }
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Soumission terminée"
            }
        }
    }
}

# Génération du changelog
function New-Changelog {
    if ($Profile -eq "production") {
        Write-Info "Génération du changelog..."
        
        $changelogFile = "CHANGELOG.md"
        $appJson = Get-Content "app.json" | ConvertFrom-Json
        $version = $appJson.expo.version
        $date = Get-Date -Format "yyyy-MM-dd"
        
        # Backup du changelog existant
        if (Test-Path $changelogFile) {
            Copy-Item $changelogFile "$changelogFile.bak"
        }
        
        # Créer le nouveau changelog
        $changelogContent = @"
# Changelog SwapStadium

## [$version] - $date

### 🚀 Nouveautés
- 

### 🐛 Corrections
- 

### 🔧 Améliorations techniques
- Build automatique v$version

---

"@
        
        if (Test-Path "$changelogFile.bak") {
            $changelogContent += Get-Content "$changelogFile.bak" -Raw
        }
        
        $changelogContent | Set-Content $changelogFile
        Write-Success "Changelog généré"
        Write-Info "Éditez $changelogFile pour ajouter les détails"
    }
}

# Notification de fin
function Show-Completion {
    Write-Success "🎉 Build terminé avec succès !"
    
    if ($Profile -eq "production") {
        Write-Info "📱 Prochaines étapes:"
        Write-Host "1. Vérifiez les builds dans Expo Dashboard"
        Write-Host "2. Testez sur device physique"
        Write-Host "3. Préparez les assets stores si nécessaire"
        Write-Host "4. Surveillez les métriques post-déploiement"
    } else {
        Write-Info "🧪 Build de test créé"
        Write-Host "1. Téléchargez et testez l'application"
        Write-Host "2. Vérifiez toutes les fonctionnalités"
        Write-Host "3. Collectez les feedbacks"
    }
}

# Fonction principale avec gestion d'erreurs
try {
    Test-Requirements
    Install-Dependencies
    Update-Version
    Test-Code
    Set-EAS
    Build-App
    Submit-ToStores
    New-Changelog
    Show-Completion
}
catch {
    Write-Error "Build échoué: $_"
    exit 1
}
