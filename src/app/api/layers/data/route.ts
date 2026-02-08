import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePathParam = searchParams.get('path');

  if (!filePathParam) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
  }

  const rootPath = process.env.GEOJSON_PATH || '../mpk_to_geojson/geojson_dir';
  const resolvedRootPath = path.resolve(process.cwd(), rootPath);
  
  // Construct full path: resolvedRootPath + groupName + filename
  // filePathParam is expected to be "groupName/filename"
  const fullPath = path.resolve(resolvedRootPath, filePathParam);

  // Security check to prevent directory traversal
  if (!fullPath.startsWith(resolvedRootPath)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  // Validate file extension
  if (!fullPath.endsWith('.geojson') && !fullPath.endsWith('.json')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 403 });
  }

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const json = JSON.parse(fileContent);

    // Validate GeoJSON format
    if (!json.type || !['FeatureCollection', 'Feature', 'GeometryCollection'].includes(json.type)) {
      return NextResponse.json({ error: 'Invalid GeoJSON format' }, { status: 400 });
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 });
  }
}
