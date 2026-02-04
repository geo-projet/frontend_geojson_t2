"use client";

import React, { useState } from 'react';

interface LayerGroup {
  groupName: string;
  files: string[];
}

interface SidebarProps {
  layers: LayerGroup[];
  activeLayerIds: string[];
  onToggleLayer: (groupName: string, fileName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ layers, activeLayerIds, onToggleLayer }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const isActive = (groupName: string, fileName: string) => {
    return activeLayerIds.includes(`${groupName}/${fileName}`);
  };

  return (
    <div className="w-80 h-full bg-white shadow-lg flex flex-col z-20 overflow-hidden border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h1 className="text-xl font-bold text-gray-800">Couches</h1>
        <p className="text-xs text-gray-500 mt-1">Explorateur GeoJSON</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {layers.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Aucune couche trouvée.
          </div>
        ) : (
          <div className="space-y-2">
            {layers.map((group) => (
              <div key={group.groupName} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => toggleGroup(group.groupName)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="font-semibold text-gray-700 text-sm">{group.groupName}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {group.files.length}
                  </span>
                </button>
                
                {expandedGroups.has(group.groupName) && (
                  <div className="bg-white p-2 space-y-1 border-t border-gray-200">
                    {group.files.map((file) => {
                      const id = `${group.groupName}/${file}`;
                      const checked = isActive(group.groupName, file);
                      
                      return (
                        <label 
                          key={id} 
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors text-sm ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={checked}
                            onChange={() => onToggleLayer(group.groupName, file)}
                          />
                          <span className={`truncate ${checked ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                            {file.replace('.geojson', '').replace('.json', '')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
