import { useEffect, useMemo, useState } from 'react';
import WorldMap from '../components/WorldMap.jsx';
import SongList from '../components/SongList.jsx';
import { Icon } from '../components/icons.jsx';
import { api } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useT } from '../i18n.js';

const MIN_DECADE = 1900;
const MAX_DECADE = Math.floor(new Date().getFullYear() / 10) * 10;

export default function Home() {
  const t = useT();
  const { playList, setFullOpen, current } = usePlayer();

  const [country, setCountry]               = useState(null);
  const [decade, setDecade]                 = useState(null);
  const [songs, setSongs]                   = useState([]);
  const [allCountriesSet, setAllCountries]  = useState(new Set());
  const [search, setSearch]                 = useState('');
  const [searchResults, setSearchResults]   = useState([]);
  const [panelOpen, setPanelOpen]           = useState(false);
  const [loading, setLoading]               = useState(false);

  // Buscador global con debounce
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    const handle = setTimeout(async () => {
      try {
        const r = await api.getSongs({ q, limit: 12 });
        setSearchResults(r);
      } catch { setSearchResults([]); }
    }, 250);
    return () => clearTimeout(handle);
  }, [search]);

  // Cargar conjunto de paises con musica una vez (para colorear el mapa)
  useEffect(() => {
    api.getSongs({ limit: 200 })
      .then(data => setAllCountries(new Set(data.map(s => s.country))))
      .catch(() => {});
  }, []);

  // Cuando cambia pais o decada, cargar canciones
  useEffect(() => {
    if (!country) { setSongs([]); return; }
    setLoading(true);
    const params = { country: country.code, limit: 60 };
    if (decade) params.decade = decade;
    api.getSongs(params)
      .then(setSongs)
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [country, decade]);

  useEffect(() => { if (country) setPanelOpen(true); }, [country]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const groupedByDecade = useMemo(() => {
    const groups = {};
    filtered.forEach(s => {
      const d = Math.floor(s.year / 10) * 10;
      (groups[d] = groups[d] || []).push(s);
    });
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map(d => [d, groups[d]]);
  }, [filtered]);

  const decadeLabel = decade ? ` · ${decade}s` : '';
  const panelTitle  = `${country?.name || ''}${decadeLabel}`;

  return (
    <div className="home-shell">
      <div className="top-bar">
        <div className="app-title">📻 Radio <span>Temporal</span></div>
        <div className="search-wrap">
          <Icon.Search />
          <input
            type="text"
            placeholder={t('home.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search.trim().length >= 2 && (
            <div className="search-dropdown">
              {searchResults.length === 0
                ? <div className="search-empty">Sin resultados</div>
                : searchResults.map((s, i) => {
                    const cover = s.coverUrl
                      || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(s.title)}`;
                    const isPlayingThis = current?._id === s._id;
                    return (
                      <div
                        key={s._id}
                        className={`search-item ${isPlayingThis ? 'playing' : ''}`}
                        onClick={() => {
                          playList(searchResults, i);
                          setFullOpen(true);
                          setSearch('');
                          setSearchResults([]);
                        }}
                      >
                        <img src={cover} alt="" />
                        <div className="search-item-info">
                          <div className="search-item-title">{s.title}</div>
                          <div className="search-item-sub">{s.artist} · {s.year}</div>
                        </div>
                        {isPlayingThis && (
                          <div className="now-playing-icon" title="Reproduciendo">
                            <Icon.Music />
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          )}
        </div>
      </div>

      <div className="map-container">
        <WorldMap
          selectedCountry={country}
          onSelect={setCountry}
          musicCountries={allCountriesSet}
        />
      </div>

      {/* decade-box FUERA del map-container para que position:fixed funcione */}
      <div className="decade-box">
        <button className="year-arrow" title="Decada anterior" onClick={() => {
          if (decade === null) setDecade(MAX_DECADE);
          else if (decade > MIN_DECADE) setDecade(decade - 10);
        }}><Icon.Left /></button>
        <button
          className={`year-display ${decade === null ? 'no-year' : ''}`}
          onClick={() => decade !== null && setDecade(null)}
          title="Click para quitar filtro"
        >
          {decade === null ? 'Decada' : `${decade}s`}
        </button>
        <button className="year-arrow" title="Decada siguiente" onClick={() => {
          if (decade === null) setDecade(MIN_DECADE);
          else if (decade < MAX_DECADE) setDecade(decade + 10);
        }}><Icon.Right /></button>
      </div>

      <div className="map-bottom">
        {!panelOpen && country && filtered.length > 0 && (
          <button className="open-panel-btn visible" onClick={() => setPanelOpen(true)}>
            <Icon.Play />
            {filtered.length} {filtered.length === 1 ? 'cancion' : 'canciones'}
          </button>
        )}
        <div className="info-bar">
          <span className="info-text">
            {country
              ? <>🌍 <strong>{country.name}</strong>{decade && <> · <strong>{decade}s</strong></>}</>
              : <>🌍 {t('home.click_country')}</>
            }
          </span>
        </div>
      </div>

      <div className={`songs-panel ${panelOpen ? 'open' : ''}`}>
        <div className="panel-handle"></div>
        <div className="panel-header">
          <div className="panel-title">{panelTitle}</div>
          <div className="panel-actions">
            {filtered.length > 0 && (
              <button className="btn-play-all" onClick={() => { playList(filtered, 0); setFullOpen(true); }}>
                <Icon.Play /> {t('home.play_all')}
              </button>
            )}
            <button className="btn-close-panel" onClick={() => setPanelOpen(false)}>
              <Icon.Down />
            </button>
          </div>
        </div>
        <div className="song-list-container">
          {loading ? <div className="spinner" /> : (
            !country
              ? <div className="empty"><Icon.Music /><p>{t('home.empty_country')}</p></div>
              : filtered.length === 0
                ? <div className="empty"><Icon.Music /><p>{t('home.no_songs')}</p></div>
                : groupedByDecade.map(([d, group]) => (
                    <div key={d} className="decade-group">
                      <div className="decade-label">
                        <span className="decade-badge">{d}s</span>
                        <span className="decade-count">{group.length} {group.length === 1 ? 'cancion' : 'canciones'}</span>
                        <button
                          className="decade-play-btn"
                          onClick={() => { playList(group, 0); setFullOpen(true); }}
                          title="Reproducir esta decada"
                        ><Icon.Play /></button>
                      </div>
                      <SongList songs={group} />
                    </div>
                  ))
          )}
        </div>
      </div>
    </div>
  );
}
