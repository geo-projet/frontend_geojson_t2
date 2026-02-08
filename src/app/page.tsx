"use client";

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';

// Dynamically import MapComponent to avoid SSR issues with OpenLayers
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Chargement de la carte...</div>
});

interface LayerGroup {
  groupName: string;
  files: string[];
}

interface ActiveLayer {
  id: string;
  groupName: string;
  fileName: string;
}

export default function Home() {
  const [layers, setLayers] = useState<LayerGroup[]>([]);
  const [activeLayers, setActiveLayers] = useState<ActiveLayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLayers() {
      try {
        const response = await fetch('/api/layers');
        if (response.ok) {
          const data = await response.json();
          setLayers(data);
        } else {
          console.error('Failed to fetch layers');
        }
      } catch (error) {
        console.error('Error fetching layers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLayers();
  }, []);

  const handleToggleLayer = useCallback((groupName: string, fileName: string) => {
    const id = `${groupName}/${fileName}`;
    setActiveLayers(prev => {
      const exists = prev.find(l => l.id === id);
      if (exists) {
        return prev.filter(l => l.id !== id);
      } else {
        return [...prev, { id, groupName, fileName }];
      }
    });
  }, []);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        layers={layers} 
        activeLayerIds={activeLayers.map(l => l.id)} 
        onToggleLayer={handleToggleLayer} 
      />
      <main className="flex-1 relative h-full">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
           </div>
        ) : (
          <MapComponent activeLayers={activeLayers} />
        )}
      </main>
    </div>
  );
}