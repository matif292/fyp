import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

const PhotoSphereViewer = ({ imageUrl, height = '400px' }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !imageUrl) return;

    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: imageUrl,
      defaultZoomLvl: 0,
      navbar: ['autorotate', 'zoom', 'fullscreen', 'settings', 'rotate'],
      settings: [
        {
          id: 'resolution',
          label: 'Quality',
          values: [
            { id: 'low', label: 'Low' },
            { id: 'high', label: 'High', default: true },
          ],
        },
      ],
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [imageUrl]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: height,
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#1a1a2e'
      }} 
    />
  );
};

export default PhotoSphereViewer;