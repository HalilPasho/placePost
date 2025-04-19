import React, { useRef, useEffect } from 'react';
import { loadGoogleMaps } from '../../util/loadGoogleMaps';
import './Map.css';

const Map = (props) => {
  const mapRef = useRef();
  const { center, zoom } = props;

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
        });

        new window.google.maps.Marker({ position: center, map });
      })
      .catch((err) => {
        console.error('Failed to load Google Maps script', err);
      });
  }, [center, zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
    ></div>
  );
};

export default Map;
