# Changelog des Améliorations

## 2026-02-15 - Sélection de Groupe et Color Picker

### 🎨 Nouvelles Fonctionnalités

#### 1. Sélection de Groupe
**Fichiers**: `src/app/page.tsx`, `src/components/Sidebar.tsx`

**Fonctionnalité**:
- ✅ Checkbox au niveau du groupe pour sélectionner/désélectionner toutes les sous-couches en un clic
- ✅ État indéterminé (indeterminate) quand certaines sous-couches sont actives
- ✅ Nouveau composant `GroupCheckbox` avec gestion de l'état via `useRef` + `useEffect`

**Implémentation**:
```typescript
// Fonction pour calculer l'état du groupe
const getGroupCheckState = (group: LayerGroup) => {
  const groupLayerIds = group.files.map(file => `${group.groupName}/${file}`);
  const activeCount = groupLayerIds.filter(id => activeLayerIds.includes(id)).length;

  if (activeCount === 0) return { checked: false, indeterminate: false };
  else if (activeCount === groupLayerIds.length) return { checked: true, indeterminate: false };
  else return { checked: false, indeterminate: true };
};

// Gestion de l'état indeterminate via ref
useEffect(() => {
  if (checkboxRef.current) {
    checkboxRef.current.indeterminate = indeterminate;
  }
}, [indeterminate]);
```

**Handler dans page.tsx**:
```typescript
const handleToggleGroup = useCallback((groupName: string) => {
  setActiveLayers(prev => {
    const group = layers.find(g => g.groupName === groupName);
    if (!group) return prev;

    const groupLayerIds = group.files.map(file => `${groupName}/${file}`);
    const allActive = groupLayerIds.every(id => prev.some(l => l.id === id));

    if (allActive) {
      // Désactiver toutes les couches
      return prev.filter(l => !groupLayerIds.includes(l.id));
    } else {
      // Activer toutes les couches manquantes
      const existingIds = new Set(prev.map(l => l.id));
      const newLayers = group.files
        .filter(file => !existingIds.has(`${groupName}/${file}`))
        .map(file => ({ id: `${groupName}/${file}`, groupName, fileName: file }));
      return [...prev, ...newLayers];
    }
  });
}, [layers]);
```

**Accessibilité**:
- ✅ `aria-label="Sélectionner toutes les couches de {groupName}"`
- ✅ `stopPropagation` pour éviter d'expand/collapse le groupe lors du clic

---

#### 2. Color Picker pour Couches
**Fichiers**: `src/app/page.tsx`, `src/components/Sidebar.tsx`, `src/components/MapComponent.tsx`

**Fonctionnalité**:
- ✅ Input HTML5 `<input type="color">` affiché à côté de chaque couche active
- ✅ Permet de personnaliser la couleur d'affichage de la couche sur la carte
- ✅ Couleur par défaut: `#3b82f6` (bleu)
- ✅ Mise à jour en temps réel du style de la couche

**Gestion de l'État** (page.tsx):
```typescript
const [layerColors, setLayerColors] = useState<Record<string, string>>({});

const handleColorChange = useCallback((layerId: string, color: string) => {
  setLayerColors(prev => ({
    ...prev,
    [layerId]: color
  }));
}, []);
```

**UI** (Sidebar.tsx):
```typescript
{checked && (
  <div className="relative">
    <input
      type="color"
      value={layerColors[id] || '#3b82f6'}
      onChange={(e) => onColorChange(id, e.target.value)}
      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
      title="Choisir une couleur"
      aria-label={`Couleur de ${file}`}
    />
  </div>
)}
```

**Application des Styles** (MapComponent.tsx):
```typescript
// Fonction helper pour créer les styles
const createLayerStyle = (color: string) => {
  const fillColor = `${color}1A`; // Ajout de 10% d'opacité (1A en hex)

  return new Style({
    stroke: new Stroke({ color: color, width: 2 }),
    fill: new Fill({ color: fillColor }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: color }),
      stroke: new Stroke({ color: 'white', width: 1 }),
    })
  });
};

// Utilisation lors de la création de couche
const layerColor = layerColors[layerInfo.id] || COLORS.PRIMARY;
const vectorLayer = new VectorLayer({
  source: source,
  style: createLayerStyle(layerColor)
});

// Mise à jour dynamique des styles
useEffect(() => {
  vectorLayersRef.current.forEach((layer, layerId) => {
    const newColor = layerColors[layerId] || COLORS.PRIMARY;
    layer.setStyle(createLayerStyle(newColor));
  });
}, [layerColors]);
```

**Avantages**:
- 🎨 Différenciation visuelle des couches
- 📊 Meilleure lisibilité des données superposées
- 🔧 Personnalisation flexible par l'utilisateur
- ⚡ Mise à jour en temps réel sans rechargement

---

## 2026-02-08 - Sécurité et Qualité

## 🔴 Corrections Critiques

### 1. Sécurité API Renforcée
**Fichier**: `src/app/api/layers/data/route.ts`
- ✅ Ajout de la validation du type de fichier (.geojson, .json uniquement)
- ✅ Ajout de la validation du format GeoJSON (type: FeatureCollection, Feature, GeometryCollection)
- ✅ Protection contre les fichiers invalides ou malveillants

### 2. TypeScript - Suppression du type `any`
**Fichier**: `src/components/MapComponent.tsx`
- ✅ Remplacement de `any` par `Record<string, unknown>` pour `selectedFeatureInfo`
- ✅ Amélioration de la sécurité de type

## 🟡 Améliorations Importantes

### 3. Métadonnées Corrigées
**Fichier**: `src/app/layout.tsx`
- ✅ Titre: "Frontend GeoJSON Viewer" (au lieu de "Create Next App")
- ✅ Description: "Visualiseur interactif de données GeoJSON avec OpenLayers"
- ✅ Langue HTML: `fr` (interface en français)

### 4. Gestion d'Erreurs Améliorée
**Fichier**: `src/components/MapComponent.tsx`
- ✅ Détection des erreurs de chargement GeoJSON
- ✅ Logs console pour le débogage
- ✅ Gestion robuste des états de source (loading, ready, error)

### 5. Accessibilité (A11y)
**Fichiers**: `src/components/MapComponent.tsx`, `src/components/ToolButton.tsx`
- ✅ Ajout de `aria-label` sur tous les boutons
- ✅ Ajout de `aria-pressed` pour les boutons d'outils
- ✅ Ajout de `role="radiogroup"` sur le sélecteur de carte de base
- ✅ Labels aria descriptifs pour les radio buttons

## 🟢 Optimisations et Bonnes Pratiques

### 6. Nouveau Composant Réutilisable
**Fichier**: `src/components/ToolButton.tsx` (nouveau)
- ✅ Composant générique pour les boutons d'outils
- ✅ Réduction de la duplication de code
- ✅ Accessibilité intégrée par défaut
- ✅ Styling cohérent

### 7. Performance - useCallback
**Fichier**: `src/app/page.tsx`
- ✅ Mémoïsation de `handleToggleLayer` avec `useCallback`
- ✅ Évite les re-renders inutiles des composants enfants

### 8. Nettoyage Mémoire Amélioré
**Fichier**: `src/components/MapComponent.tsx`
- ✅ Nettoyage des sources vectorielles lors du démontage
- ✅ Clear des refs (vectorLayersRef, drawSourceRef)
- ✅ Prévention des fuites mémoire

### 9. Extraction des Constantes
**Fichier**: `src/components/MapComponent.tsx`
- ✅ Constantes `MAP_DEFAULTS` (center, zoom, padding, etc.)
- ✅ Constantes `COLORS` (couleurs du design system)
- ✅ Code plus maintenable et configurable
- ✅ Single source of truth pour les valeurs

### 10. Documentation des Variables d'Environnement
**Fichier**: `.env.example` (nouveau)
- ✅ Documentation de `GEOJSON_PATH`
- ✅ Exemple de configuration
- ✅ Facilite l'onboarding des nouveaux développeurs

## 📊 Résumé des Modifications

| Type | Nombre | Impact |
|------|--------|--------|
| 🔴 Sécurité | 2 | Haute |
| 🟡 Fonctionnalité | 3 | Moyenne |
| 🟢 Code Quality | 5 | Moyenne |
| **Total** | **10** | - |

## 📁 Fichiers Modifiés

1. ✏️ `src/app/layout.tsx` - Métadonnées et langue
2. ✏️ `src/app/page.tsx` - useCallback
3. ✏️ `src/app/api/layers/data/route.ts` - Sécurité et validation
4. ✏️ `src/components/MapComponent.tsx` - Refactoring majeur
5. ✨ `src/components/ToolButton.tsx` - Nouveau composant
6. ✨ `.env.example` - Nouveau fichier
7. ✨ `CHANGELOG_IMPROVEMENTS.md` - Ce fichier

## 🧪 Tests Recommandés

Avant de déployer en production, tester :

1. **Sécurité**:
   - ✅ Tenter d'accéder à un fichier non-.geojson
   - ✅ Tenter un path traversal (../../../etc/passwd)
   - ✅ Charger un JSON invalide (non-GeoJSON)

2. **Fonctionnalité**:
   - ✅ Charger plusieurs couches GeoJSON
   - ✅ Basculer entre les outils (navigate, select, draw)
   - ✅ Sélectionner des features et voir les attributs
   - ✅ Dessiner des rectangles et les effacer
   - ✅ Basculer entre OSM et Satellite

3. **Accessibilité**:
   - ✅ Navigation au clavier (Tab, Enter, Space)
   - ✅ Lecteur d'écran (NVDA/JAWS) - vérifier les labels
   - ✅ Contraste des couleurs (WCAG 2.1 AA)

4. **Performance**:
   - ✅ Charger 10+ couches simultanément
   - ✅ Fichiers GeoJSON volumineux (>1MB)
   - ✅ Memory leaks avec React DevTools Profiler

## 🚀 Prochaines Étapes Suggérées

1. Ajouter des tests unitaires (Vitest)
2. Ajouter des tests E2E (Playwright)
3. Implémenter un système de notification pour les erreurs utilisateur
4. Ajouter un indicateur de chargement par couche
5. Implémenter le clustering pour grandes datasets

## 📝 Notes de Migration

Aucune migration nécessaire. Toutes les modifications sont rétrocompatibles.

## 🤝 Contributeurs

- Claude Sonnet 4.5 <noreply@anthropic.com>
