# Frontend GeoJSON Viewer - Documentation Projet

## Vue d'ensemble

Application web moderne de visualisation de données GeoJSON construite avec **Next.js 16**, **React 19**, **OpenLayers 10** et **Tailwind CSS 4**. L'application permet de charger, visualiser et interagir avec des couches GeoJSON via une interface cartographique interactive.

## Stack Technique

- **Framework**: Next.js 16.1.6 (App Router, React Server Components)
- **UI Library**: React 19.2.3
- **Cartographie**: OpenLayers 10.7.0
- **Styling**: Tailwind CSS 4 (avec @tailwindcss/postcss)
- **Language**: TypeScript 5
- **Linting**: ESLint 9 avec configuration Next.js
- **Testing**: Playwright 1.58.1

## Architecture du Projet

```
frontend_geojson_t2/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── layers/
│   │   │       ├── route.ts           # API pour lister les répertoires GeoJSON
│   │   │       └── data/route.ts      # API pour servir les fichiers GeoJSON
│   │   ├── page.tsx                   # Page principale (orchestrateur)
│   │   ├── layout.tsx                 # Layout racine Next.js
│   │   └── favicon.ico
│   └── components/
│       ├── MapComponent.tsx           # Composant carte OpenLayers
│       ├── Sidebar.tsx                # Sidebar de gestion des couches
│       └── ToolButton.tsx             # Bouton d'outil réutilisable
├── public/                            # Assets statiques (SVG icons)
├── .env.example                       # Variables d'environnement
├── CLAUDE.md                          # Ce fichier
├── CHANGELOG_IMPROVEMENTS.md          # Historique des améliorations
├── tsconfig.json                      # Configuration TypeScript
├── next.config.ts                     # Configuration Next.js
├── postcss.config.mjs                 # Configuration PostCSS
├── eslint.config.mjs                  # Configuration ESLint
└── package.json
```

## Composants Principaux

### 1. `page.tsx` (Orchestrateur)
- **Rôle**: Point d'entrée de l'application, gère l'état global
- **État géré**:
  - `layers`: Liste des groupes de couches disponibles
  - `activeLayers`: Couches actuellement affichées sur la carte
  - `layerColors`: Couleurs personnalisées par couche (Record<layerId, color>)
  - `loading`: État de chargement initial
- **Fonctionnalités**:
  - Fetch des couches disponibles depuis `/api/layers`
  - Toggle des couches actives/inactives avec `useCallback` pour performance
  - Toggle de groupe: activer/désactiver toutes les sous-couches d'un groupe
  - Gestion des couleurs personnalisées par couche
  - Import dynamique du MapComponent (évite les erreurs SSR avec OpenLayers)
- **Structure de données**:
  ```typescript
  interface LayerGroup {
    groupName: string;  // Nom du répertoire
    files: string[];    // Liste des fichiers .geojson/.json
  }

  interface ActiveLayer {
    id: string;         // Format: "groupName/fileName"
    groupName: string;
    fileName: string;
  }
  ```

### 2. `MapComponent.tsx` (Composant Carte)
- **Rôle**: Gestion complète de la carte OpenLayers et des interactions
- **Configuration carte**:
  - Projection: EPSG:4326 (WGS84)
  - Centre initial: [0, 0] (configuré via `MAP_DEFAULTS`)
  - Zoom initial: 2
  - Contrôles: Désactivation des contrôles zoom/rotate par défaut
- **Constantes extraites**:
  ```typescript
  const MAP_DEFAULTS = {
    INITIAL_CENTER: [0, 0],
    INITIAL_ZOOM: 2,
    MAX_ZOOM: 16,
    FIT_PADDING: [50, 50, 50, 50],
    DRAW_Z_INDEX: 999,
  };

  const COLORS = {
    PRIMARY: '#3b82f6',
    PRIMARY_LIGHT: 'rgba(59, 130, 246, 0.1)',
    DRAW_STROKE: '#ffcc33',
    SELECT_STROKE: 'rgba(255, 0, 0, 0.7)',
  };
  ```
- **Couches de base**:
  - **OSM**: OpenStreetMap (TileLayer avec source OSM)
  - **Satellite**: Imagerie Google Maps (`mt1.google.com/vt/lyrs=s`)
- **Outils disponibles** (`toolMode`):
  - `navigate`: Navigation standard (pan, zoom, rotation)
  - `select`: Sélection de features avec affichage des attributs
  - `draw`: Dessin de rectangles (ROI - Region of Interest)
- **Gestion des couches GeoJSON**:
  - Création dynamique de VectorLayer pour chaque couche active
  - **Styles personnalisables**:
    - Fonction `createLayerStyle(color)` pour générer les styles OpenLayers
    - Couleur par défaut: bleu (`COLORS.PRIMARY = '#3b82f6'`)
    - Couleurs personnalisées via prop `layerColors`
    - Fill avec 10% d'opacité (ajout de `1A` au code hex)
    - Styles adaptés: stroke (lignes), fill (polygones), circle (points)
  - Auto-zoom sur l'extent de la couche lors du chargement
  - Suppression automatique des couches désactivées
  - **Mise à jour dynamique**: useEffect qui met à jour les styles quand les couleurs changent
  - **Gestion d'erreurs**: Détection et log des erreurs de chargement
- **Nettoyage mémoire amélioré**:
  - Clear des sources vectorielles lors du démontage
  - Prévention des memory leaks

### 3. `Sidebar.tsx` (Gestionnaire de Couches)
- **Rôle**: Interface de sélection des couches à afficher
- **Fonctionnalités**:
  - Liste groupée hiérarchique (répertoires → fichiers)
  - Collapse/Expand des groupes
  - **Sélection de groupe**:
    - Checkbox au niveau du groupe pour sélectionner/désélectionner toutes les sous-couches
    - Composant `GroupCheckbox` avec état indéterminé (indeterminate)
    - États: ☐ (aucune active), ☑ (certaines actives), ✓ (toutes actives)
    - Gestion via `useRef` + `useEffect` pour la propriété HTML `indeterminate`
  - Checkboxes pour activer/désactiver les couches individuelles
  - **Color picker**:
    - Input HTML5 `<input type="color">` affiché à côté de chaque couche active
    - Permet de personnaliser la couleur d'affichage de la couche
    - Couleur par défaut: `#3b82f6` (bleu)
    - Mise à jour en temps réel sur la carte
  - Badge avec nombre de fichiers par groupe
  - Affichage du statut (couches actives en bleu)
- **Style**: Largeur fixe 320px (w-80), scroll vertical automatique

### 4. `ToolButton.tsx` (Composant Réutilisable)
- **Rôle**: Composant générique pour les boutons d'outils
- **Avantages**:
  - Réduction de la duplication de code
  - Accessibilité intégrée (`aria-label`, `aria-pressed`)
  - Styling cohérent
- **Props**:
  ```typescript
  interface ToolButtonProps {
    mode: ToolMode;
    currentMode: ToolMode;
    onClick: () => void;
    title: string;
    ariaLabel: string;
    icon: React.ReactNode;
  }
  ```

## API Routes (Backend Next.js)

### 1. `/api/layers` (`GET`)
- **Fonction**: Liste tous les répertoires et fichiers GeoJSON disponibles
- **Configuration**:
  - Variable d'environnement: `GEOJSON_PATH` (défaut: `../mpk_to_geojson/geojson_dir`)
  - Chemin résolu depuis `process.cwd()`
- **Logique**:
  1. Lit le répertoire racine
  2. Pour chaque sous-répertoire, liste les fichiers `.geojson` ou `.json`
  3. Retourne un tableau de `LayerGroup`
- **Gestion d'erreurs**:
  - Si le répertoire n'existe pas: retourne `[]` (array vide)
  - En cas d'erreur de lecture: retourne 500 avec message d'erreur

### 2. `/api/layers/data?path=<groupName>/<fileName>` (`GET`)
- **Fonction**: Sert le contenu du fichier GeoJSON
- **Paramètre**: `path` (format: "groupName/fileName")
- **Sécurité renforcée** ✅:
  1. Validation path traversal (vérifie que le chemin est dans `resolvedRootPath`)
  2. **Validation du type de fichier** (seuls .geojson et .json acceptés)
  3. **Validation du format GeoJSON** (type doit être FeatureCollection, Feature ou GeometryCollection)
- **Headers**: `Content-Type: application/json`
- **Codes de retour**:
  - 200: Succès
  - 400: Paramètre manquant ou GeoJSON invalide
  - 403: Path traversal ou type de fichier invalide
  - 404: Fichier non trouvé
  - 500: Erreur de lecture

## Configuration des Chemins de Données

**Important**: Le chemin des données GeoJSON est configurable via la variable d'environnement `GEOJSON_PATH`.

- **Défaut**: `../mpk_to_geojson/geojson_dir` (relatif au répertoire du projet)
- **Structure attendue**:
  ```
  geojson_dir/
  ├── groupe1/
  │   ├── layer1.geojson
  │   └── layer2.json
  ├── groupe2/
  │   └── layer3.geojson
  ```

Pour modifier:
```bash
# Copier .env.example vers .env.local
cp .env.example .env.local

# Éditer .env.local
GEOJSON_PATH=/chemin/absolu/vers/geojson_dir
```

## Commandes Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement sur http://localhost:3000

# Production
npm run build        # Build de production
npm run start        # Lance le serveur de production

# Qualité de code
npm run lint         # Exécute ESLint
```

## Configuration TypeScript

- **Cible**: ES2017
- **JSX**: react-jsx (nouvelle transformation JSX de React 17+)
- **Module**: ESNext avec résolution "bundler"
- **Alias de chemin**: `@/*` → `./src/*`
- **Strict mode**: Activé
- **Plugins**: Next.js TypeScript plugin

## Styling avec Tailwind CSS

- **Version**: 4.x (nouvelle architecture)
- **Configuration**: PostCSS avec `@tailwindcss/postcss`
- **Approche**: Utility-first avec classes personnalisées
- **Design System**:
  - Couleurs principales: Bleu (#3b82f6 via `COLORS.PRIMARY`), Gris (palette complète)
  - Espacements: Système de spacing Tailwind standard
  - Responsive: Layout adaptatif avec classes flex/grid

## Patterns de Développement

### 1. Gestion d'État
- **État local**: `useState` pour UI state (toolMode, selectedFeature, baseLayer)
- **État partagé**: Props drilling (layers, activeLayers)
- **Refs**: Stockage des instances OpenLayers (map, layers) pour éviter re-renders
- **Performance**: `useCallback` pour les handlers passés en props

### 2. Effets et Side Effects
- **Initialisation carte**: `useEffect` sans dépendances (une seule fois)
- **Synchronisation couches**: `useEffect` avec `activeLayers` comme dépendance
- **Nettoyage amélioré**: Proper cleanup avec clear des sources et refs

### 3. Dynamic Import
```typescript
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,  // CRITIQUE: OpenLayers ne supporte pas SSR
  loading: () => <LoadingSpinner />
});
```

### 4. Constantes et Configuration
```typescript
// ✅ GOOD: Extraire les valeurs de config
const MAP_DEFAULTS = { INITIAL_CENTER: [0, 0], INITIAL_ZOOM: 2 };
const COLORS = { PRIMARY: '#3b82f6', PRIMARY_LIGHT: 'rgba(59, 130, 246, 0.1)' };

// ❌ BAD: Valeurs hardcodées
center: [0, 0]  // Où est-ce défini? Difficile à changer
```

### 5. TypeScript Strict
```typescript
// ✅ GOOD: Type sûr
const [info, setInfo] = useState<Record<string, unknown> | null>(null);

// ❌ BAD: Type any
const [info, setInfo] = useState<any>(null);
```

### 6. Accessibilité
```typescript
// ✅ GOOD: Labels ARIA appropriés
<button
  aria-label="Outil de navigation de la carte"
  aria-pressed={mode === 'navigate'}
  title="Naviguer"
>

// ❌ BAD: Pas de labels
<button title="Naviguer">
```

## OpenLayers - Spécificités

### Projection EPSG:4326
- **Raison**: Projection géographique standard (lat/lon)
- **Implications**: Coordonnées en degrés décimaux
- **Avantages**: Compatible directement avec GeoJSON standard

### Draw Interaction
```typescript
const drawInteraction = new Draw({
  source: drawSourceRef.current,
  type: 'Circle',
  geometryFunction: createBox(),  // Transforme le cercle en rectangle
});
```

### Fit View sur Couche
```typescript
source.on('change', () => {
  if (source.getState() === 'ready') {
    const extent = source.getExtent();
    if (!extent.includes(Infinity) && !extent.includes(-Infinity)) {
      map.getView().fit(extent, {
        padding: MAP_DEFAULTS.FIT_PADDING,
        maxZoom: MAP_DEFAULTS.MAX_ZOOM
      });
    }
  } else if (source.getState() === 'error') {
    console.error(`Erreur: ${layerInfo.fileName}`);
  }
});
```

## Sécurité

### Validation API (Critique)
1. **Path Traversal**: Vérification que le chemin reste dans `resolvedRootPath`
2. **Type de fichier**: Seuls .geojson et .json acceptés
3. **Format GeoJSON**: Validation du type (FeatureCollection, Feature, GeometryCollection)

### Exemple de tentative d'attaque bloquée
```bash
# ❌ Bloqué par validation path traversal
/api/layers/data?path=../../etc/passwd

# ❌ Bloqué par validation extension
/api/layers/data?path=groupe/malware.exe

# ❌ Bloqué par validation GeoJSON
/api/layers/data?path=groupe/invalid.json  # JSON valide mais pas GeoJSON
```

## Problèmes Connus et Solutions

### 1. SSR et OpenLayers
**Problème**: OpenLayers utilise des APIs browser-only (window, document)
**Solution**: Dynamic import avec `ssr: false`

### 2. Extent Infinity
**Problème**: Source vide ou invalide peut donner extent [Infinity, ...]
**Solution**: Vérification avant fit:
```typescript
if (!extent.includes(Infinity) && !extent.includes(-Infinity)) {
  map.getView().fit(extent, options);
}
```

### 3. Memory Leaks
**Problème**: Instances OpenLayers non nettoyées
**Solution**: Cleanup complet dans useEffect return:
```typescript
return () => {
  vectorLayersRef.current.forEach(layer => layer.getSource()?.clear());
  vectorLayersRef.current.clear();
  drawSourceRef.current.clear();
  map.setTarget(undefined);
};
```

## Améliorations Récentes

### 2026-02-15 - Sélection de groupe et Color Picker
- ✅ **Sélection de groupe**: Checkbox au niveau du groupe pour activer/désactiver toutes les sous-couches
  - État indéterminé (indeterminate) quand certaines couches sont actives
  - Composant `GroupCheckbox` avec gestion via useRef/useEffect
- ✅ **Color picker**: Sélecteur de couleur pour chaque couche active
  - Input HTML5 `<input type="color">`
  - Couleurs stockées dans l'état `layerColors` (Record<string, string>)
  - Application dynamique des couleurs aux styles OpenLayers
  - Mise à jour en temps réel du style de la couche
- ✅ Fonction `createLayerStyle(color)` pour générer les styles OpenLayers
- ✅ Transparence adaptative (10% opacity pour le fill des polygones)

### 2026-02-08 - Sécurité et Qualité
Voir `CHANGELOG_IMPROVEMENTS.md` pour les détails complets.

**Résumé**:
- ✅ Sécurité API renforcée (validation fichiers + GeoJSON)
- ✅ Suppression des types `any`
- ✅ Composant `ToolButton` réutilisable
- ✅ Accessibilité améliorée (ARIA labels)
- ✅ Extraction des constantes (MAP_DEFAULTS, COLORS)
- ✅ Nettoyage mémoire amélioré
- ✅ Performance optimisée (useCallback)
- ✅ Gestion d'erreurs de chargement GeoJSON
- ✅ Documentation des variables d'environnement

## Améliorations Futures Possibles

### Fonctionnalités
- [ ] Export de ROI en GeoJSON
- [ ] Mesure de distance/surface
- [x] Styling personnalisé par couche (✅ Color picker implémenté)
- [ ] Recherche/filtre de features
- [ ] Clustering pour grandes datasets
- [ ] Légende dynamique
- [ ] Import de fichiers GeoJSON via upload

### Performance
- [ ] Virtualisation de la liste des couches
- [ ] Lazy loading des features (pagination)
- [ ] Web Workers pour parsing GeoJSON volumineux
- [ ] Cache des tiles avec Service Worker

### UX
- [ ] Tooltips sur hover des features
- [ ] Persistance de l'état dans localStorage
- [ ] Raccourcis clavier
- [ ] Mode plein écran
- [ ] Thème sombre
- [ ] Notifications utilisateur pour les erreurs

## Notes Importantes pour le Développement

### Workflow de Développement
1. **Modifications de composants**: Hot reload automatique
2. **Modifications d'API routes**: Redémarrage du serveur requis
3. **Modifications TypeScript**: Vérifier les erreurs avec `npm run lint`

### Debugging OpenLayers
- Utiliser `map.getLayers().getArray()` pour inspecter les couches
- `source.getFeatures()` pour voir les features chargées
- Console browser > Network pour voir les requêtes GeoJSON
- Console logs pour les erreurs de chargement (état 'error')

### Performance
- Limiter le nombre de couches actives simultanées (< 10 recommandé)
- Pour datasets > 10000 features, considérer vectorTiles ou clustering
- Désactiver les couches non visibles plutôt que les supprimer

### Git et Collaboration
- **Branche principale**: `main`
- **Commit messages**: Format conventionnel recommandé
- **Co-authored commits**: Inclure `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

## Ressources et Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [OpenLayers API](https://openlayers.org/en/latest/apidoc/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GeoJSON Specification](https://geojson.org/)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## Contact et Support

Pour toute question ou contribution:
- **Repository**: https://github.com/geo-projet/frontend_geojson_t2
- **Issues**: Utiliser le système d'issues GitHub
- **License**: MIT
