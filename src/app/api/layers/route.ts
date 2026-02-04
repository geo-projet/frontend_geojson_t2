import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const rootPath = process.env.GEOJSON_PATH || '../mpk_to_geojson/geojson_dir';
  const resolvedRootPath = path.resolve(process.cwd(), rootPath);

  if (!fs.existsSync(resolvedRootPath)) {
    // If the directory doesn't exist, try to create it or just return empty for now to prevent crash
    console.warn(`Data directory not found: ${resolvedRootPath}`);
    return NextResponse.json([]); 
  }

  try {
    const items = fs.readdirSync(resolvedRootPath, { withFileTypes: true });
    const layers = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const dirPath = path.join(resolvedRootPath, item.name);
        const files = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.geojson') || file.endsWith('.json'));

        if (files.length > 0) {
          layers.push({
            groupName: item.name,
            files: files
          });
        }
      }
    }

    return NextResponse.json(layers);
  } catch (error) {
    console.error('Error reading layers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
