import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Hong Kong center coordinates
const HK_CENTER = [22.3193, 114.1694];

// District coordinates (approximate)
const DISTRICT_COORDS = {
  '中西區': [22.2868, 114.1507],
  '灣仔': [22.2767, 114.1716],
  '東區': [22.2842, 114.2241],
  '南區': [22.2470, 114.1584],
  '油尖旺': [22.3117, 114.1694],
  '深水埗': [22.3308, 114.1623],
  '九龍城': [22.3282, 114.1919],
  '黃大仙': [22.3419, 114.1932],
  '觀塘': [22.3119, 114.2260],
  '葵青': [22.3540, 114.1270],
  '荃灣': [22.3707, 114.1140],
  '屯門': [22.3907, 113.9726],
  '元朗': [22.4445, 114.0223],
  '北區': [22.4940, 114.1383],
  '大埔': [22.4513, 114.1644],
  '沙田': [22.3816, 114.1873],
  '西貢': [22.3838, 114.2706],
  '離島': [22.2618, 113.9460]
};

export default function PropertyMap({ properties, className }) {
  // Filter properties with coordinates or use district coords
  const markersData = properties.map(p => {
    if (p.latitude && p.longitude) {
      return { ...p, coords: [p.latitude, p.longitude] };
    }
    if (p.district && DISTRICT_COORDS[p.district]) {
      // Add small random offset to avoid overlapping markers
      const offset = () => (Math.random() - 0.5) * 0.02;
      return { 
        ...p, 
        coords: [
          DISTRICT_COORDS[p.district][0] + offset(),
          DISTRICT_COORDS[p.district][1] + offset()
        ] 
      };
    }
    return null;
  }).filter(Boolean);

  const formatPrice = (price, type) => {
    if (price >= 10000) {
      return `$${(price / 10000).toFixed(0)}萬${type === 'rent' ? '/月' : ''}`;
    }
    return `$${price.toLocaleString()}${type === 'rent' ? '/月' : ''}`;
  };

  return (
    <div className={className}>
      <MapContainer 
        center={HK_CENTER} 
        zoom={11} 
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markersData.map(property => (
          <Marker 
            key={property.id} 
            position={property.coords}
            icon={customIcon}
          >
            <Popup>
              <div className="w-48">
                {property.images?.[0] && (
                  <img 
                    src={property.images[0]} 
                    alt="" 
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold text-sm line-clamp-1">{property.title}</p>
                <p className="text-[#FF385C] font-bold">
                  {formatPrice(property.price, property.listing_type)}
                </p>
                <p className="text-xs text-gray-500">
                  {property.bedrooms}房 · {property.saleable_area}呎
                </p>
                <Link 
                  to={createPageUrl('PropertyDetail') + `?id=${property.id}`}
                  className="text-xs text-[#FF385C] underline mt-1 block"
                >
                  查看詳情
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}