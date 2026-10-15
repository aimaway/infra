# 📁 Infracentra - Structure des Fichiers Modulaires

## 🎯 Architecture Modulaire

Le projet est maintenant organisé en fichiers indépendants pour faciliter la personnalisation sans connaissances techniques approfondies.

```
src/
├── data/                          # 📊 DONNÉES (Modifier ici pour changer le contenu)
│   ├── servicesData.ts           # Les 16 services principaux
│   ├── navigationData.ts         # Structure de navigation (menus)
│   ├── comingSoonServices.ts     # Services à venir
│   └── mockData.ts               # Données de démo (clients, utilisateurs)
│
├── components/                    # 🧩 COMPOSANTS RÉUTILISABLES
│   └── landing/                  # Composants de la landing page
│       ├── Navigation.tsx        # Barre de navigation
│       ├── HeroSection.tsx       # Section héro (haut de page)
│       ├── PlatformPillars.tsx   # Les 3 piliers
│       ├── ServicesGrid.tsx      # Grille des 16 services
│       ├── MSSPSection.tsx       # Section MSSP/MDR
│       ├── PricingSection.tsx    # Section tarifs
│       ├── AcademySection.tsx    # Section académie
│       └── Footer.tsx            # Pied de page
│
└── pages/                         # 📄 PAGES COMPLÈTES
    ├── LandingPage.tsx           # Page d'accueil (assemble les composants)
    ├── LoginPage.tsx             # Page de connexion
    ├── ServiceDetailPage.tsx     # Page détail d'un service
    ├── ComingSoonPage.tsx        # Page "Bientôt disponible"
    └── [autres pages...]         # Dashboards, etc.
```

---

## 🛠️ Comment Personnaliser le Contenu

### 1️⃣ Modifier les Services (16 services principaux)

**Fichier :** `src/data/servicesData.ts`

Pour modifier un service existant :
```typescript
{
  id: 'threat-intel',              // ID unique du service
  name: 'Threat Intelligence',     // Nom affiché
  category: 'security',            // Catégorie : security | networking | psa
  icon: '🎯',                      // Emoji affiché
  tagline: 'See threats before they see you',  // Slogan
  description: '...',              // Description courte
  longDescription: '...',          // Description détaillée
  features: [...],                 // Liste des fonctionnalités
  architecture: [...],             // Étapes de l'architecture
  integrations: [...],             // Outils intégrés
  useCases: [...],                 // Cas d'usage
  metrics: [...],                  // Métriques clés
}
```

**Pour ajouter un nouveau service :**
1. Copiez un service existant
2. Changez l'`id` (doit être unique)
3. Modifiez les informations
4. Le service apparaîtra automatiquement dans la grille

---

### 2️⃣ Modifier la Navigation (Menus déroulants)

**Fichier :** `src/data/navigationData.ts`

Structure de la navigation :
```typescript
{
  label: 'Products',               // Texte du menu
  dropdown: [                      // Menus déroulants
    {
      category: 'Unified Platform', // Catégorie
      items: [
        { 
          label: 'AI-Focused SIEM', 
          desc: 'Description...', 
          icon: Database,           // Icône Lucide
          href: '/service/threat-intel'  // Lien
        },
      ]
    }
  ]
}
```

**Pour modifier un lien :**
- Changez `href` pour pointer vers un autre service
- Utilisez `/service/[id]` pour les services existants
- Utilisez `/coming-soon/[id]` pour les services à venir

**Pour ajouter un élément de menu :**
```typescript
{ 
  label: 'Nouveau Service', 
  desc: 'Description...', 
  icon: Shield, 
  href: '/service/mon-service' 
}
```

---

### 3️⃣ Ajouter des Services "Bientôt Disponibles"

**Fichier :** `src/data/comingSoonServices.ts`

```typescript
{
  id: 'itdr',                      // ID unique
  name: 'Identity Threat Detection & Response',
  category: 'security',            // security | networking | psa | ai
  icon: '🔐',                      // Emoji
  tagline: 'Protect identities, prevent breaches',
  description: 'Description détaillée...',
  expectedFeatures: [              // Fonctionnalités prévues
    'Feature 1',
    'Feature 2',
  ],
  targetAudience: 'Équipes sécurité',
  estimatedLaunch: 'Q2 2027',      // Date de lancement prévue
}
```

**Pour ajouter un service à venir :**
1. Ajoutez un nouvel objet dans le tableau `comingSoonServices`
2. Créez une entrée dans `navigationData.ts` avec `href: '/coming-soon/[id]'`
3. La page sera automatiquement générée

---

### 4️⃣ Modifier les Sections de la Landing Page

Chaque section est un composant indépendant :

#### Hero Section (Haut de page)
**Fichier :** `src/components/landing/HeroSection.tsx`
- Titre principal
- Statistiques (16 services, 94% block rate, etc.)
- Boutons CTA

#### Platform Pillars (3 piliers)
**Fichier :** `src/components/landing/PlatformPillars.tsx`
- Security Orchestration
- Network Management
- PSA Services

#### Services Grid (Grille des services)
**Fichier :** `src/components/landing/ServicesGrid.tsx`
- Affiche automatiquement les 16 services de `servicesData.ts`

#### MSSP Section
**Fichier :** `src/components/landing/MSSPSection.tsx`
- Avantages partenaires
- Statistiques (250+ partners, 40% margin, etc.)

#### Pricing Section
**Fichier :** `src/components/landing/PricingSection.tsx`
- 3 plans tarifaires (SME, Mid-Market, Enterprise)
- Fonctionnalités de chaque plan

#### Academy Section
**Fichier :** `src/components/landing/AcademySection.tsx`
- Formation, Certifications, Communauté

#### Footer
**Fichier :** `src/components/landing/Footer.tsx`
- Liens, Copyright, Badges de conformité

---

## 🔒 Sécurité et Séparation des Responsabilités

### Principe de Séparation
- **Données** (`src/data/`) : Contenu modifiable sans toucher au code
- **Composants** (`src/components/`) : Structure visuelle réutilisable
- **Pages** (`src/pages/`) : Assemblage des composants
- **Routes** (`src/App.tsx`) : Navigation entre les pages

### Avantages
✅ **Non-développeurs** : Peuvent modifier le contenu dans `src/data/` sans risque  
✅ **Développeurs** : Peuvent modifier l'UI dans `src/components/` sans affecter les données  
✅ **Évolutivité** : Ajout facile de nouveaux services ou sections  
✅ **Maintenance** : Chaque fichier a une responsabilité claire  

---

## 📝 Exemples de Modifications Courantes

### Exemple 1 : Changer le slogan d'un service
```typescript
// Dans src/data/servicesData.ts
{
  id: 'threat-intel',
  tagline: 'Votre nouveau slogan ici',  // ← Modifier cette ligne
  // ...
}
```

### Exemple 2 : Ajouter une fonctionnalité à un service
```typescript
// Dans src/data/servicesData.ts
{
  id: 'compliance',
  features: [
    { title: 'Fonctionnalité existante', description: '...', icon: '📋' },
    { title: 'Nouvelle fonctionnalité', description: '...', icon: '✨' },  // ← Ajouter
  ],
}
```

### Exemple 3 : Modifier un lien dans la navigation
```typescript
// Dans src/data/navigationData.ts
{ 
  label: 'Threat Intelligence', 
  desc: 'Description...', 
  icon: Target, 
  href: '/service/threat-intel'  // ← Changer le lien
}
```

### Exemple 4 : Ajouter un service "Bientôt disponible"
```typescript
// Dans src/data/comingSoonServices.ts
{
  id: 'mon-nouveau-service',
  name: 'Mon Nouveau Service',
  category: 'security',
  icon: '🚀',
  tagline: 'Slogan accrocheur',
  description: 'Description détaillée...',
  expectedFeatures: ['Feature 1', 'Feature 2'],
  targetAudience: 'Public cible',
  estimatedLaunch: 'Q4 2027',
}
```

---

## 🎨 Personnalisation Visuelle

### Couleurs
Les couleurs sont définies dans `src/index.css` :
```css
--color-cyber-blue: #00d4ff;
--color-cyber-green: #00ff88;
--color-cyber-purple: #8b5cf6;
```

### Animations
Animations CSS dans `src/index.css` :
- `animate-fade-in-up`
- `animate-fade-in`
- `animate-slide-in-right`
- `animate-float`

### Icônes
Icônes Lucide React : https://lucide.dev/icons/
Importez-les dans vos composants :
```typescript
import { Shield, Target, Network } from 'lucide-react';
```

---

## 🚀 Commandes Utiles

```bash
# Démarrer l'application
docker compose up -d

# Reconstruire après modifications
docker compose up --build -d

# Voir les logs
docker compose logs -f

# Arrêter
docker compose down
```

---

## 📞 Support

Pour toute question sur la structure ou les modifications :
1. Consultez ce guide
2. Regardez les exemples dans les fichiers `src/data/`
3. Testez vos modifications en local avant de déployer

---

## ✅ Checklist de Modification

Avant de déployer vos modifications :
- [ ] Tester en local avec `docker compose up --build -d`
- [ ] Vérifier que tous les liens fonctionnent
- [ ] Valider l'affichage sur mobile et desktop
- [ ] Vérifier les performances (pas de ralentissement)
- [ ] Documenter les changements apportés

---

**Dernière mise à jour :** 2027-01-15  
**Version :** 2.0.0 (Architecture Modulaire)
