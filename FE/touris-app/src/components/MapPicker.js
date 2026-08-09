import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 80);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function MapPicker({
  latitude,
  longitude,
  onPick,
  markers = [],
  height = 360,
  mapKey = 'map',
}) {
  const centerLat = latitude ?? 44.7866;
  const centerLng = longitude ?? 20.4489;

  return (
    <div className="map-shell" style={{ height }}>
      <MapContainer
        key={mapKey}
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />
        <ClickHandler onPick={onPick} />
        {latitude != null && longitude != null && (
          <Marker position={[latitude, longitude]} icon={markerIcon} />
        )}
        {markers.map((m) => (
          <Marker
            key={m.id || `${m.latitude}-${m.longitude}`}
            position={[m.latitude, m.longitude]}
            icon={markerIcon}
          />
        ))}
      </MapContainer>
    </div>
  );
}
