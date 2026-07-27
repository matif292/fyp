import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import SearchDock from '../components/SearchDock';
import HostelCard from '../components/HostelCard';
import { getHostels } from '../api/hostels';
import { resolveUploadUrl } from '../api/client';
import { Compass, ShieldCheck, Star, Sparkles, MapPin, ArrowRight } from 'lucide-react';

const FALLBACK_DESTINATIONS = [
  { name: 'Hunza', tag: 'Valleys & glaciers' },
  { name: 'Skardu', tag: 'High peaks' },
  { name: 'Swat', tag: 'Rivers & orchards' },
  { name: 'Naran', tag: 'Alpine lakes' },
];

export default function Landing() {
  const [destinations, setDestinations] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ hostels: 0, cities: 0, reviews: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getHostels({ limit: 100 });
        let hostels = [];
        if (response.data?.success) hostels = response.data.data || [];
        else if (Array.isArray(response.data)) hostels = response.data;
        else if (response.data?.data) hostels = response.data.data;

        // Featured = highest rated with photos first
        const sorted = [...hostels].sort(
          (a, b) =>
            (Number(b.rating) || 0) * (Number(b.total_reviews) || 1) -
            (Number(a.rating) || 0) * (Number(a.total_reviews) || 1)
        );
        setFeatured(sorted.slice(0, 6));

        // Unique cities with counts + a cover photo
        const cityMap = new Map();
        hostels.forEach((h) => {
          if (!h.city) return;
          const name = h.city.trim();
          const entry = cityMap.get(name);
          if (entry) {
            entry.count += 1;
            if (!entry.image && h.photos?.[0]?.photo_url) entry.image = h.photos[0].photo_url;
          } else {
            cityMap.set(name, {
              name,
              tag: h.state || 'Pakistan',
              count: 1,
              image: h.photos?.[0]?.photo_url || null,
            });
          }
        });
        const cities = Array.from(cityMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setDestinations(cities.length ? cities : FALLBACK_DESTINATIONS);

        setStats({
          hostels: hostels.length,
          cities: cityMap.size,
          reviews: hostels.reduce((s, h) => s + (parseInt(h.total_reviews) || 0), 0),
          rating: hostels.length
            ? hostels.reduce((s, h) => s + (parseFloat(h.rating) || 0), 0) / hostels.length
            : 0,
        });
      } catch {
        setDestinations(FALLBACK_DESTINATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app-shell tz-page">
      <PublicNavbar />

      {/* ── Hero: one clear job — search ─────────────────────────── */}
      <section className="tz-hero">
        <div className="tz-container tz-hero-inner">
          <span className="tz-eyebrow">Verified stays across Pakistan's north</span>
          <h1 className="tz-hero-title">
            Find your next stay in the mountains
          </h1>
          <p className="tz-hero-sub">
            Hostels and guesthouses in Hunza, Skardu, Swat and beyond — every owner
            document-verified, every review from a completed stay.
          </p>
        </div>
        <div className="tz-container tz-hero-dock">
          <SearchDock />
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────── */}
      <section className="tz-container tz-trust">
        <div className="tz-trust-item">
          <ShieldCheck size={20} />
          <div>
            <h4>Verified owners</h4>
            <p>Every host passes a document review before listing.</p>
          </div>
        </div>
        <div className="tz-trust-item">
          <Star size={20} />
          <div>
            <h4>Real reviews only</h4>
            <p>Ratings come from travelers who completed a stay.</p>
          </div>
        </div>
        <div className="tz-trust-item">
          <Compass size={20} />
          <div>
            <h4>Mapped locations</h4>
            <p>Every stay is geo-tagged along documented routes.</p>
          </div>
        </div>
        {stats.reviews > 0 && (
          <div className="tz-trust-item tz-trust-item--stat">
            <span className="tz-score-plate">{stats.rating.toFixed(1)}</span>
            <div>
              <h4>{stats.reviews.toLocaleString()}+ reviews</h4>
              <p>across {stats.hostels} stays in {stats.cities} cities</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Popular destinations ─────────────────────────────────── */}
      <section className="tz-container tz-section">
        <div className="tz-section-head">
          <div>
            <span className="tz-eyebrow tz-eyebrow--dark">Popular destinations</span>
            <h2>Where travelers are booking</h2>
          </div>
          <Link to="/hostels" className="tz-linkbtn">
            Browse all stays <ArrowRight size={14} />
          </Link>
        </div>
        <div className="tz-dest-grid">
          {(loading ? FALLBACK_DESTINATIONS : destinations).map((d) => (
            <button
              key={d.name}
              className="tz-dest-card"
              onClick={() => navigate(`/hostels?city=${encodeURIComponent(d.name)}`)}
            >
              <div className="tz-dest-media">
                {d.image ? (
                  <img src={resolveUploadUrl(d.image)} alt={d.name} loading="lazy" />
                ) : (
                  <div className="tz-dest-fallback" />
                )}
              </div>
              <div className="tz-dest-body">
                <h3>
                  <MapPin size={14} /> {d.name}
                </h3>
                <p>
                  {d.tag}
                  {d.count ? ` · ${d.count} stay${d.count === 1 ? '' : 's'}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── AI trip planner banner ───────────────────────────────── */}
      <section className="tz-container">
        <div className="tz-ai-banner">
          <div className="tz-ai-copy">
            <span className="tz-eyebrow">
              <Sparkles size={13} /> Trip planner
            </span>
            <h2>Not sure where to go? Describe your dream trip.</h2>
            <p>
              Tell us your budget, dates and interests — we'll put together an
              itinerary with stays along the route.
            </p>
          </div>
          <Link to="/trips" className="tz-btn tz-btn--light">
            Plan my trip <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Featured stays ───────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="tz-container tz-section">
          <div className="tz-section-head">
            <div>
              <span className="tz-eyebrow tz-eyebrow--dark">Top rated</span>
              <h2>Stays travelers loved</h2>
            </div>
          </div>
          <div className="tz-grid">
            {featured.map((h) => (
              <HostelCard key={h.id} hostel={h} viewMode="grid" />
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="tz-footer">
        <div className="tz-container tz-footer-inner">
          <div>
            <Link to="/" className="brand" style={{ color: 'white' }}>
              <span className="brand-mark" /> Tripzo
            </Link>
            <p>Booking infrastructure for Pakistan's north.</p>
          </div>
          <nav className="tz-footer-links">
            <Link to="/hostels">Explore stays</Link>
            <Link to="/trips">Trip planner</Link>
            <Link to="/register-owner">List your property</Link>
            <Link to="/login">Log in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
