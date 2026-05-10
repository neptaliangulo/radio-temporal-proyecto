import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { COUNTRIES } from '../countries.js';

const STYLE_DEFAULT   = { color: '#2a2a2a', weight: 1.2, fillColor: '#1f1f1f', fillOpacity: 0.9 };
const STYLE_HOVER     = { color: '#444',    weight: 1.5, fillColor: '#2a3a2a', fillOpacity: 0.95 };
const STYLE_SELECTED  = { color: '#4ade80', weight: 2.5, fillColor: '#14532d', fillOpacity: 0.9 };
const STYLE_HAS_MUSIC = { color: '#1DB954', weight: 1.8, fillColor: '#1a2d1a', fillOpacity: 0.95 };

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

const NAME_TO_ISO = (() => {
  const m = {};
  for (const [iso, name] of COUNTRIES) m[name.toLowerCase()] = iso;
  const extra = {
    'united states of america': 'US',
    'russian federation':       'RU',
    'republic of korea':        'KR',
    'south korea':              'KR',
    'czechia':                  'CZ',
    'czech republic':           'CZ',
    'iran (islamic republic of)': 'IR',
    'syrian arab republic':     'SY',
    'viet nam':                 'VN',
    'lao pdr':                  'LA',
    'myanmar':                  'MM',
    'burma':                    'MM',
    'tanzania':                 'TZ',
    'united republic of tanzania':'TZ',
    'congo':                    'CG',
    'democratic republic of the congo': 'CD',
    "cote d'ivoire":            'CI',
    'ivory coast':              'CI',
    'macedonia':                'MK',
    'north macedonia':          'MK',
    'the former yugoslav republic of macedonia': 'MK'
  };
  Object.assign(m, extra);
  return m;
})();

function isoFromFeature(feature) {
  const p = feature.properties || {};
  const iso2 = p.ISO_A2 || p.iso_a2 || p.ISO_A2_EH;
  if (iso2 && iso2 !== '-99' && iso2 !== '') return iso2.toUpperCase();
  const name = (p.ADMIN || p.name || p.NAME || '').toLowerCase();
  return NAME_TO_ISO[name] || null;
}

function nameFromFeature(feature) {
  const p = feature.properties || {};
  return p.ADMIN || p.name || p.NAME || p.NAME_LONG || 'Pais';
}

export default function WorldMap({ selectedCountry, onSelect, musicCountries = new Set() }) {
  const ref         = useRef(null);
  const mapRef      = useRef(null);
  const layerRef    = useRef(null);
  const selRef      = useRef(selectedCountry);
  const onSelectRef = useRef(onSelect);
  const musicRef    = useRef(musicCountries);

  useEffect(() => { selRef.current = selectedCountry; }, [selectedCountry]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { musicRef.current = musicCountries; }, [musicCountries]);

  useEffect(() => {
    if (mapRef.current) return;
    const WORLD = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));

    const map = L.map(ref.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: false,
      maxBounds: WORLD,
      maxBoundsViscosity: 1.0,
      inertia: false
    });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19, noWrap: true, bounds: WORLD
    }).addTo(map);
    mapRef.current = map;

    // Recalcular el zoom minimo para que el mundo SIEMPRE llene el viewport
    // (en Chrome el ancho efectivo es distinto al de Opera, y el zoom fijo se
    // queda corto, dejando bordes negros). fitBounds calcula el zoom optimo.
    const refit = () => {
      map.invalidateSize();
      const z = map.getBoundsZoom(WORLD, true); // zoom que cabe el mundo en el viewport
      map.setMinZoom(z);
      if (map.getZoom() < z) map.setZoom(z);
      map.panInsideBounds(WORLD, { animate: false });
    };
    setTimeout(refit, 50);
    setTimeout(refit, 300);
    setTimeout(refit, 800);
    window.addEventListener('resize', refit);

    // Forzar que la camara nunca salga de los bounds (algunos navegadores
    // ignoran el viscosity y permiten arrastrar mas alla del mundo).
    map.on('drag moveend zoomend', () => {
      map.panInsideBounds(WORLD, { animate: false });
    });

    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(data => {
        const layer = L.geoJSON(data, {
          style: () => STYLE_DEFAULT,
          onEachFeature: (feature, l) => {
            l._isoCode     = isoFromFeature(feature);
            l._countryName = nameFromFeature(feature);
            l.bindTooltip(l._countryName, { sticky: true, className: 'rt-tooltip' });

            l.on({
              mouseover: (e) => {
                const lay = e.target;
                if (lay._leaflet_id === selRef.current?.id) return;
                lay.setStyle(STYLE_HOVER);
                lay.bringToFront();
              },
              mouseout: (e) => {
                const lay = e.target;
                if (lay._leaflet_id === selRef.current?.id) return;
                lay.setStyle(STYLE_DEFAULT);
              },
              click: (e) => {
                const lay = e.target;
                onSelectRef.current?.({
                  id:   lay._leaflet_id,
                  code: lay._isoCode,
                  name: lay._countryName
                });
              }
            });
          }
        }).addTo(map);
        layerRef.current = layer;
        applyStyles(layer, selRef.current, musicRef.current);
      })
      .catch(err => console.error('GeoJSON error:', err));

    return () => {
      window.removeEventListener('resize', refit);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    applyStyles(layer, selectedCountry, musicCountries);
  }, [selectedCountry, musicCountries]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

function applyStyles(geoLayer, sel /*, music */) {
  const selId = sel?.id;
  geoLayer.eachLayer(l => {
    if (selId != null && l._leaflet_id === selId) {
      l.setStyle(STYLE_SELECTED);
      l.bringToFront();
    } else {
      l.setStyle(STYLE_DEFAULT);
    }
  });
}
