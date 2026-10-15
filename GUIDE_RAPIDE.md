# 🚀 Guide Rapide - Infracentra

## 📍 Où Modifier Quoi ?

### 🎯 Vous voulez modifier...

| Contenu | Fichier à modifier | Difficulté |
|---------|-------------------|------------|
| **Les 16 services** | `src/data/servicesData.ts` | ⭐ Facile |
| **Les menus de navigation** | `src/data/navigationData.ts` | ⭐ Facile |
| **Les services "Bientôt"** | `src/data/comingSoonServices.ts` | ⭐ Facile |
| **Les clients de démo** | `src/data/mockData.ts` | ⭐⭐ Moyen |
| **Le texte du Hero** | `src/components/landing/HeroSection.tsx` | ⭐⭐ Moyen |
| **Les tarifs** | `src/components/landing/PricingSection.tsx` | ⭐⭐ Moyen |
| **Les couleurs** | `src/index.css` | ⭐⭐⭐ Avancé |
| **La structure des pages** | `src/pages/LandingPage.tsx` | ⭐⭐⭐ Avancé |

---

## 🎨 Structure Visuelle

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATION                            │
│  Products | Services | Why Infracentra | MSSP | Pricing │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   HERO SECTION                           │
│         "See. Know. Act." + Stats + CTA Buttons         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               PLATFORM PILLARS (3 cartes)                │
│    Security | Network Management | PSA Services         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              SERVICES GRID (16 services)                 │
│    Cliquez sur un service → Page de détail              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 MSSP/MDR SECTION                         │
│         Partenaires + Avantages + Statistiques           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 PRICING SECTION                          │
│         SME ($499) | Mid-Market ($2,999) | Enterprise   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 ACADEMY SECTION                          │
│         Formation | Certifications | Communauté          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      FOOTER                              │
│         Liens | Copyright | Badges de conformité         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Modifications Courantes (Copier-Coller)

### ✅ Ajouter un nouveau service

**Étape 1 :** Ouvrir `src/data/servicesData.ts`

**Étape 2 :** Copier ce modèle à la fin du tableau :

```typescript
{
  id: 'mon-service',                    // ← ID unique (pas d'espaces)
  name: 'Mon Nouveau Service',          // ← Nom affiché
  category: 'security',                 // ← security | networking | psa
  icon: '🚀',                           // ← Emoji
  tagline: 'Slogan accrocheur',         // ← Slogan court
  description: 'Description courte pour la grille.',
  longDescription: 'Description détaillée pour la page complète.',
  features: [
    { title: 'Fonctionnalité 1', description: 'Description', icon: '✨' },
    { title: 'Fonctionnalité 2', description: 'Description', icon: '🔒' },
    { title: 'Fonctionnalité 3', description: 'Description', icon: '📊' },
    { title: 'Fonctionnalité 4', description: 'Description', icon: '🎯' },
    { title: 'Fonctionnalité 5', description: 'Description', icon: '⚡' },
    { title: 'Fonctionnalité 6', description: 'Description', icon: '🛡️' },
  ],
  architecture: [
    { step: 'Étape 1', description: 'Description de l\'étape' },
    { step: 'Étape 2', description: 'Description de l\'étape' },
    { step: 'Étape 3', description: 'Description de l\'étape' },
    { step: 'Étape 4', description: 'Description de l\'étape' },
    { step: 'Étape 5', description: 'Description de l\'étape' },
    { step: 'Étape 6', description: 'Description de l\'étape' },
  ],
  integrations: ['Outil 1', 'Outil 2', 'Outil 3'],
  useCases: [
    { title: 'Cas d\'usage 1', description: 'Description' },
    { title: 'Cas d\'usage 2', description: 'Description' },
    { title: 'Cas d\'usage 3', description: 'Description' },
  ],
  metrics: [
    { label: 'Métrique 1', value: '100+', description: 'Description' },
    { label: 'Métrique 2', value: '99%', description: 'Description' },
    { label: 'Métrique 3', value: '<1s', description: 'Description' },
    { label: 'Métrique 4', value: '24/7', description: 'Description' },
  ],
}
```

**Étape 3 :** Sauvegarder et redémarrer :
```bash
docker compose up --build -d
```

---

### ✅ Modifier un lien dans la navigation

**Étape 1 :** Ouvrir `src/data/navigationData.ts`

**Étape 2 :** Trouver le lien à modifier :
```typescript
{ 
  label: 'Threat Intelligence', 
  desc: 'Aggregated threat data and IoCs', 
  icon: Target, 
  href: '/service/threat-intel'  // ← Modifier ici
}
```

**Étape 3 :** Changer le `href` :
- Vers un service existant : `/service/[id-du-service]`
- Vers une page "bientôt" : `/coming-soon/[id]`
- Vers une page statique : `/mssp`, `/pricing`, `/academy`

---

### ✅ Ajouter un service "Bientôt disponible"

**Étape 1 :** Ouvrir `src/data/comingSoonServices.ts`

**Étape 2 :** Ajouter à la fin du tableau :
```typescript
{
  id: 'mon-service-futur',
  name: 'Mon Service Futur',
  category: 'security',
  icon: '🔮',
  tagline: 'Slogan du service futur',
  description: 'Description de ce qui arrivera bientôt...',
  expectedFeatures: [
    'Fonctionnalité 1',
    'Fonctionnalité 2',
    'Fonctionnalité 3',
  ],
  targetAudience: 'Public cible',
  estimatedLaunch: 'Q1 2028',
}
```

**Étape 3 :** Ajouter un lien dans `navigationData.ts` :
```typescript
{ 
  label: 'Mon Service Futur', 
  desc: 'Description...', 
  icon: Target, 
  href: '/coming-soon/mon-service-futur' 
}
```

---

### ✅ Modifier les statistiques du Hero

**Fichier :** `src/components/landing/HeroSection.tsx`

**Trouver :**
```typescript
const stats = [
  { value: '16', label: 'Integrated Services', icon: Layers },
  { value: '94%', label: 'Threat Block Rate', icon: Shield },
  { value: '14m', label: 'Mean Time to Detect', icon: Target },
  { value: '2.4h', label: 'Mean Time to Respond', icon: Zap },
];
```

**Modifier les valeurs :**
```typescript
const stats = [
  { value: '20', label: 'Integrated Services', icon: Layers },  // ← Changer
  { value: '95%', label: 'Threat Block Rate', icon: Shield },   // ← Changer
  // ...
];
```

---

### ✅ Modifier les tarifs

**Fichier :** `src/components/landing/PricingSection.tsx`

**Trouver :**
```typescript
const plans = [
  {
    tier: 'SME',
    price: '$499',
    desc: 'For small teams...',
    features: ['Feature 1', 'Feature 2'],
    popular: false
  },
  // ...
];
```

**Modifier :**
```typescript
{
  tier: 'SME',
  price: '$599',              // ← Nouveau prix
  desc: 'Nouvelle description',
  features: [
    'Feature 1',
    'Feature 2',
    'Nouvelle Feature',       // ← Ajouter
  ],
  popular: false
}
```

---

## 🔧 Commandes Essentielles

```bash
# Démarrer l'application
docker compose up -d

# Reconstruire après modifications
docker compose up --build -d

# Voir les logs en temps réel
docker compose logs -f

# Arrêter tous les conteneurs
docker compose down

# Nettoyer et reconstruire complètement
docker compose down
docker system prune -f
docker compose up --build -d
```

---

## 🌐 URLs à Connaître

| Page | URL |
|------|-----|
| **Landing Page** | http://localhost:3000 |
| **Login** | http://localhost:3000/#/login |
| **Service Detail** | http://localhost:3000/#/service/threat-intel |
| **Coming Soon** | http://localhost:3000/#/coming-soon/itdr |
| **Platform Admin** | http://localhost:3000/#/admin/dashboard |
| **Client Admin** | http://localhost:3000/#/client-admin/dashboard |
| **Client User** | http://localhost:3000/#/dashboard |

---

## 👥 Comptes de Démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Platform Admin** | ops@infracentra.io | (n'importe quoi) |
| **Client Admin** | sarah.chen@infracentracorp.io | (n'importe quoi) |
| **Client User** | marcus.j@infracentracorp.io | (n'importe quoi) |

---

## 📚 Ressources

- **Guide complet de modification** : `GUIDE_MODIFICATION.md`
- **Documentation production** : `PRODUCTION.md`
- **Intégrations open-source** : `INTEGRATIONS.md`
- **README principal** : `README.md`

---

## ❓ Problèmes Courants

### La page ne se met pas à jour
```bash
# Vider le cache du navigateur
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Ou ouvrir en navigation privée
```

### Erreur de build
```bash
# Nettoyer et reconstruire
docker compose down
docker system prune -f
docker compose up --build -d
```

### Les modifications ne s'appliquent pas
```bash
# Vérifier que le fichier est sauvegardé
# Redémarrer les conteneurs
docker compose restart frontend
```

---

**Besoin d'aide ?** Consultez `GUIDE_MODIFICATION.md` pour des exemples détaillés.
