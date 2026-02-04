# Frontend GeoJSON Viewer

A modern web application built with [Next.js](https://nextjs.org) and [OpenLayers](https://openlayers.org/) to visualize and interact with GeoJSON data.

## Features

- **Interactive Map**: Built using OpenLayers, supporting zoom, pan, and rotation.
- **Layer Management**: Dynamically load and display GeoJSON layers.
- **Base Maps**: Switch between OpenStreetMap (OSM) and Satellite imagery.
- **Tools**:
  - **Navigate**: Standard map navigation.
  - **Select**: Click on features to view their attributes in a floating panel.
  - **Draw ROI**: Draw rectangular Regions of Interest (ROI) on the map.
- **Responsive Design**: Styled with Tailwind CSS for a modern look and feel.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (React)
- **Map Library**: [OpenLayers](https://openlayers.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/geo-projet/frontend_geojson_t2.git
   cd frontend_geojson_t2
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: React components (MapComponent, Sidebar, etc.).
- `public`: Static assets.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)