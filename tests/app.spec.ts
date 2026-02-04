import { test, expect } from '@playwright/test';

test('App loads and displays core components', async ({ page }) => {
  // 1. Accéder à la page d'accueil
  await page.goto('/');

  // 2. Vérifier le titre de la Sidebar
  await expect(page.getByText('Couches')).toBeVisible();
  await expect(page.getByText('Explorateur GeoJSON')).toBeVisible();

  // 3. Vérifier que la carte est présente
  // Attendre que le chargement soit fini
  await expect(page.getByText('Chargement de la carte...')).toBeHidden();
  
  // On attend que le canvas soit attaché au DOM
  const mapCanvas = page.locator('canvas').first();
  await expect(mapCanvas).toBeVisible({ timeout: 10000 });

  // 4. Vérifier le sélecteur de fond de carte
  await expect(page.getByText('OSM')).toBeVisible();
  await expect(page.getByText('Satellite')).toBeVisible();
  
  // 5. Tester le basculement de fond de carte
  const satelliteRadio = page.getByRole('radio', { name: 'Satellite' });
  await satelliteRadio.click();
  await expect(satelliteRadio).toBeChecked();
  
  const osmRadio = page.getByRole('radio', { name: 'OSM' });
  await osmRadio.click();
  await expect(osmRadio).toBeChecked();

  // 6. Vérifier la présence d'au moins un groupe si des données existent
  const groupButtons = page.locator('button span.font-semibold');
  const count = await groupButtons.count();
  if (count > 0) {
      console.log(`Found ${count} layer groups.`);
      await groupButtons.first().click(); // Déplier le premier groupe
      // Vérifier si des checkbox apparaissent
      await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
  } else {
      console.log('No layer groups found (check data directory).');
  }
});