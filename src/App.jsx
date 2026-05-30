import './App.css';
import { useEffect, useRef, useState } from 'react';

export default function App() {
  return (
    <div className="dashboard">
      <div className="topbar">
        <div>
          <h1>Armen Space Dashboard</h1>
          <p className="subtitle">Сборка космической информации на одной странице.</p>
        </div>
        <p className="date">Сегодня: {today()}</p>
      </div>

      <div className="card-row">
        <section className="card">
          <h2>Координаты</h2>
          <Kamo latitude="42.36" longitude="-71.05" />
        </section>

        <section className="card">
          <h2>Статус</h2>
          <Karen name="ISS" status="В космосе" />
        </section>

        <section className="card">
          <h2>Исследование</h2>
          <Tak name="Ровер" status="Активен" />
        </section>
      </div>

      <div className="large-card-group">
        <section className="card card-large">
          <h2>NASA APOD</h2>
          <APOD />
        </section>

        <section className="card card-large iss-card">
          <h2>ISS Tracker</h2>
          <ISSTracker />
        </section>

        <section className="card card-large">
          <h2>People in Space</h2>
          <PeopleInSpace />
        </section>
      </div>

      <div className="single-card-column">
        <section className="card">
          <h2>Asteroids</h2>
          <Asteroids />
        </section>
      </div>

      <div className="card-row">
        <section className="card">
          <h2>Moon Phase</h2>
          <MoonPhase />
        </section>

        <section className="card">
          <h2>Марс</h2>
          <MarsWeather />
        </section>

        <section className="card">
          <h2>Солнце</h2>
          <SunInfo />
        </section>
      </div>

      <div className="single-card-column">
        <section className="card">
          <h2>Next Launch</h2>
          <NextLaunch />
        </section>

        <section className="card">
          <h2>Space News</h2>
          <SpaceNews />
        </section>

        <section className="card">
          <h2>ISS Live Feed</h2>
          <ISSLiveFeed />
        </section>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(n, digits = 0) {
  return Number(n).toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
}

/* ================= SIMPLE COMPONENTS ================= */

function Kamo(props) {
  return (
    <div className="mini-card">
      <p>Coordinates</p>
      <p>Latitude: {props.latitude}</p>
      <p>Longitude: {props.longitude}</p>
    </div>
  );
}

function Karen(props) {
  return (
    <div className="mini-card">
      <p>Status</p>
      <p>{props.name}</p>
      <p>{props.status}</p>
    </div>
  );
}

function Tak(props) {
  return (
    <div className="mini-card">
      <p>Exploring Space</p>
      <p>{props.name}</p>
      <p>{props.status}</p>
    </div>
  );
}

/* ================= COUNTER ================= */

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button className="action-button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}

/* ================= ISS TRACKER ================= */

function ISSTracker() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    async function loadISS() {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await res.json();
        setLocation(data);
      } catch (e) {
        console.error(e);
      }
    }

    loadISS();
    const interval = setInterval(loadISS, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mini-card">
      <p>ISS Position</p>
      {location ? (
        <>
          <p>Latitude: {location.latitude.toFixed(2)}</p>
          <p>Longitude: {location.longitude.toFixed(2)}</p>
          <p>Velocity: {fmt(location.velocity)} km/h</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

/* ================= PEOPLE IN SPACE ================= */

function PeopleInSpace() {
  const [people, setPeople] = useState(null);

  useEffect(() => {
    fetch('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json')
      .then((r) => r.json())
      .then((data) => setPeople(data.people))
      .catch(console.error);
  }, []);

  return (
    <div className="mini-card">
      {people ? (
        <ul>
          {people.map((person) => (
            <li key={person.name}>👨‍🚀 {person.name}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

/* ================= NASA APOD ================= */

function APOD() {
  const [pic, setPic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nasaKey = import.meta.env.VITE_NASA_KEY || 'DEMO_KEY';

  useEffect(() => {
    async function loadApod() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaKey}`);
        const data = await res.json();
        if (!res.ok || data.code || data.error) {
          throw new Error(data.msg || data.error?.message || 'Ошибка NASA APOD');
        }
        setPic(data);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Не удалось загрузить NASA APOD.');
      } finally {
        setLoading(false);
      }
    }

    loadApod();
  }, [nasaKey]);

  return (
    <div className="apod-card">
      {loading ? (
        <p className="status">Loading APOD...</p>
      ) : error ? (
        <p className="status error">{error}</p>
      ) : pic ? (
        <>
          <h3>{pic.title}</h3>
          {pic.media_type === 'image' ? (
            <img className="apod-image" src={pic.url} alt={pic.title} />
          ) : (
            <a className="news-link button-link" href={pic.url} target="_blank" rel="noreferrer">
              Watch Video
            </a>
          )}
          <p className="apod-explanation">{pic.explanation}</p>
        </>
      ) : (
        <p className="status">APOD data is not available.</p>
      )}
    </div>
  );
}

/* ================= ASTEROIDS ================= */

function Asteroids() {
  const [asteroids, setAsteroids] = useState([]);
  const [hazardousCount, setHazardousCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const nasaKey = import.meta.env.VITE_NASA_KEY || 'DEMO_KEY';

  useEffect(() => {
    async function loadAsteroids() {
      setLoading(true);
      setError(null);
      try {
        const date = today();
        const res = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${nasaKey}`
        );
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error?.message || 'Ошибка NASA Asteroids');
        }
        const neos = data.near_earth_objects?.[date] || [];
        const sorted = [...neos].sort(
          (a, b) =>
            parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || 0) -
            parseFloat(b.close_approach_data?.[0]?.miss_distance?.kilometers || 0)
        );
        setAsteroids(sorted.slice(0, 8));
        setHazardousCount(neos.filter((n) => n.is_potentially_hazardous_asteroid).length);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Не удалось загрузить данные астероидов.');
      } finally {
        setLoading(false);
      }
    }
    loadAsteroids();
  }, [nasaKey]);

  useEffect(() => {
    if (!canvasRef.current || !asteroids.length) return;
    drawAsteroidMap(canvasRef.current, asteroids);
  }, [asteroids]);

  return (
    <div className="mini-card">
      <div className="stat-row">
        <div>
          <strong>{asteroids.length}</strong>
          <p>Closest Objects</p>
        </div>
        <div>
          <strong>{hazardousCount}</strong>
          <p>Potentially Hazardous</p>
        </div>
      </div>
      <canvas ref={canvasRef} width={260} height={260} />
      {loading ? (
        <p>Loading asteroid data...</p>
      ) : error ? (
        <p className="status error">{error}</p>
      ) : asteroids.length ? (
        <ul>
          {asteroids.slice(0, 5).map((neo) => (
            <li key={neo.id}>
              ☄ {neo.name.replace(/[()]/g, '')} — Miss Distance: {fmt(neo.close_approach_data?.[0]?.miss_distance?.kilometers)} km
            </li>
          ))}
        </ul>
      ) : (
        <p>No asteroid data for today.</p>
      )}
    </div>
  );
}

/* ================= CANVAS ================= */

function drawAsteroidMap(canvas, asteroids) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#050816';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(130, 130, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#2f81f7';
  ctx.fill();

  asteroids.forEach((neo, i) => {
    const radius = 35 + i * 18;
    const angle = (i / asteroids.length) * Math.PI * 2;
    const x = 130 + Math.cos(angle) * radius;
    const y = 130 + Math.sin(angle) * radius;
    const hazardous = neo.is_potentially_hazardous_asteroid;
    ctx.beginPath();
    ctx.arc(x, y, hazardous ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = hazardous ? '#ff4d4d' : '#bbbbbb';
    ctx.fill();
  });
}

/* ================= MOON PHASE ================= */

function MoonPhase() {
  const [phase, setPhase] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const result = getMoonPhase();
    setPhase(result);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !phase) return;
    const ctx = canvasRef.current.getContext('2d');
    const cx = 60;
    const cy = 60;
    const r = 50;
    ctx.clearRect(0, 0, 120, 120);

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 120, 120);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2f45';
    ctx.fill();

    ctx.beginPath();
    const illum = phase.fraction;
    const litStart = illum < 0.5 ? Math.PI / 2 : 0;
    const litEnd = illum < 0.5 ? (3 * Math.PI) / 2 : Math.PI * 2;
    ctx.arc(cx, cy, r, litStart, litEnd);
    ctx.fillStyle = '#f3e9c4';
    ctx.fill();
  }, [phase]);

  if (!phase) return <p>Loading...</p>;

  return (
    <div className="mini-card">
      <canvas ref={canvasRef} width={120} height={120} />
      <p>{phase.name}</p>
      <p>Illumination: {(phase.fraction * 100).toFixed(0)}%</p>
      <p>Days to Full Moon: {Math.round(phase.daysToFull)}</p>
    </div>
  );
}

function getMoonPhase() {
  const now = new Date();
  const knownNewMoon = new Date('2024-01-11T11:57:00Z');
  const synodicMonth = 29.53058867;
  const daysSince = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  const fraction = phase / synodicMonth;
  const daysToFull = Math.abs(14.77 - phase);
  let name = 'Waxing Crescent';

  if (fraction < 0.03 || fraction > 0.97) name = '🌑 New Moon';
  else if (fraction < 0.25) name = '🌒 Waxing Crescent';
  else if (fraction < 0.28) name = '🌓 First Quarter';
  else if (fraction < 0.5) name = '🌔 Waxing Gibbous';
  else if (fraction < 0.53) name = '🌕 Full Moon';
  else if (fraction < 0.75) name = '🌖 Waning Gibbous';
  else if (fraction < 0.78) name = '🌗 Last Quarter';
  else name = '🌘 Waning Crescent';

  return { fraction, name, daysToFull };
}

/* ================= MARS WEATHER ================= */

function MarsWeather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`https://api.nasa.gov/insight_weather/?api_key=${import.meta.env.VITE_NASA_KEY || 'DEMO_KEY'}&feedtype=json&ver=1.0`)
      .then((r) => r.json())
      .then((data) => {
        const sols = data.sol_keys;
        if (!sols || sols.length === 0) {
          setError(true);
          return;
        }
        const latest = sols[sols.length - 1];
        const sol = data[latest];
        setWeather({
          sol: latest,
          avgTemp: sol.AT?.av?.toFixed(1) ?? 'N/A',
          minTemp: sol.AT?.mn?.toFixed(1) ?? 'N/A',
          maxTemp: sol.AT?.mx?.toFixed(1) ?? 'N/A',
          pressure: sol.PRE?.av?.toFixed(0) ?? 'N/A',
          windSpeed: sol.HWS?.av?.toFixed(1) ?? 'N/A',
        });
      })
      .catch(() => setError(true));
  }, []);

  return (
    <div className="mini-card">
      <p>🔴 Mars Weather</p>
      {error ? (
        <>
          <p>InSight Mission (ended Dec 2022)</p>
          <p>Last recorded avg temp: −60°C</p>
          <p>Pressure: ~700 Pa</p>
          <p>Winds: 5–10 m/s</p>
        </>
      ) : weather ? (
        <>
          <p>Sol {weather.sol}</p>
          <p>🌡 Avg: {weather.avgTemp}°C</p>
          <p>Min: {weather.minTemp}°C / Max: {weather.maxTemp}°C</p>
          <p>💨 Wind: {weather.windSpeed} m/s</p>
          <p>📊 Pressure: {weather.pressure} Pa</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

/* ================= SUN INFO ================= */

function SunInfo() {
  const [sunData, setSunData] = useState(null);

  useEffect(() => {
    fetch('https://api.sunrise-sunset.org/json?lat=42.36&lng=-71.05&formatted=0')
      .then((r) => r.json())
      .then((data) => {
        const r = data.results;
        const rise = new Date(r.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const set = new Date(r.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dayLen = r.day_length;
        const hours = Math.floor(dayLen / 3600);
        const mins = Math.floor((dayLen % 3600) / 60);
        setSunData({ rise, set, dayLen: `${hours}h ${mins}m` });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="mini-card">
      <p>☀️ Sun / Boston</p>
      {sunData ? (
        <>
          <p>🌅 Sunrise: {sunData.rise}</p>
          <p>🌇 Sunset: {sunData.set}</p>
          <p>Daylight: {sunData.dayLen}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

/* ================= NEXT ROCKET LAUNCH ================= */

function NextLaunch() {
  const [launch, setLaunch] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=1&ordering=net&format=json')
      .then((r) => r.json())
      .then((data) => {
        const l = data.results?.[0];
        if (l) setLaunch(l);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!launch) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const target = new Date(launch.net).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown('Launch soon!');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setCountdown(`${days}d ${hours}h ${minutes}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, [launch]);

  return (
    <div className="mini-card">
      {launch ? (
        <>
          <p>{launch.name}</p>
          <p>{launch.launch_service_provider?.name}</p>
          <p>📍 {launch.pad?.location?.name}</p>
          <p>{countdown}</p>
          <p>{new Date(launch.net).toUTCString()}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

/* ================= SPACE NEWS ================= */

function SpaceNews() {
  const [articles, setArticles] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=6&ordering=-published_at')
      .then((r) => r.json())
      .then((data) => setArticles(data.results || []))
      .catch(console.error);
  }, []);

  return (
    <div className="mini-card news-list">
      {articles.length ? (
        <div>
          {articles.map((a, i) => (
            <div key={a.id} className="news-item">
              <button className="news-title" onClick={() => setExpanded(expanded === i ? null : i)}>
                {a.title}
              </button>
              <div className="news-meta">
                <span>{a.news_site}</span>
                <span>{new Date(a.published_at).toLocaleDateString()}</span>
              </div>
              {expanded === i && (
                <div className="news-summary">
                  <p>{a.summary}</p>
                  <a className="news-link button-link" href={a.url} target="_blank" rel="noreferrer">
                    Read full article →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading news...</p>
      )}
    </div>
  );
}

/* ================= ISS LIVE FEED ================= */

function ISSLiveFeed() {
  const [show, setShow] = useState(false);

  return (
    <div className="mini-card">
      <p>📺 ISS Live Camera</p>
      <p>Live HD stream from the International Space Station (NASA HDEV)</p>
      {!show ? (
        <button className="action-button" onClick={() => setShow(true)}>
          ▶ Load Live Stream
        </button>
      ) : (
        <div className="video-frame">
          <iframe
            title="ISS Live"
            src="https://www.youtube.com/embed/xxxxxxxxxxx"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

