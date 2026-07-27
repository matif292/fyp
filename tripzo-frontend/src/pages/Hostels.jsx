import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import HostelCard from '../components/HostelCard';
import SearchDock from '../components/SearchDock';
import { getHostels } from '../api/hostels';
import { apiErrorMessage } from '../api/client';
import { Grid, List, X } from 'lucide-react';

const PROPERTY_TYPES = ['hostel', 'hotel', 'guesthouse'];
const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'Free WiFi' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'parking', label: 'Parking' },
  { key: 'mountain_view', label: 'Mountain view' },
  { key: 'heater', label: 'Heater' },
];
const RATING_STEPS = [4.5, 4, 3.5, 3];

const safeParse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    const p = JSON.parse(data);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

export default function Hostels() {
  const [params, setParams] = useSearchParams();

  // Server-side query (what the API supports)
  const query = {
    city: params.get('city') || '',
    checkIn: params.get('checkIn') || '',
    checkOut: params.get('checkOut') || '',
    guests: params.get('guests') || '',
  };

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');

  // Client-side refinements (instant, no page reload — chips over dropdowns)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    types: [],
    amenities: [],
    minRating: null,
  });
  const [sort, setSort] = useState('recommended');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const apiQuery = {};
        if (query.city) apiQuery.city = query.city;
        const { data } = await getHostels(apiQuery);
        setHostels(data.data || []);
      } catch (err) {
        setError(apiErrorMessage(err, 'Could not load stays.'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onSearch = (next) => setParams(next);

  const toggle = (key, value) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));

  const clearFilters = () =>
    setFilters({ minPrice: '', maxPrice: '', types: [], amenities: [], minRating: null });

  const activeFilterCount =
    filters.types.length +
    filters.amenities.length +
    (filters.minRating ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  const priceOf = (h) => {
    const direct = Number(h.min_price ?? h.starting_price ?? h.price_per_night);
    if (direct > 0) return direct;
    const prices = safeParse(h.room_types)
      .map((r) => Number(r.price_per_night))
      .filter((p) => p > 0);
    return prices.length ? Math.min(...prices) : null;
  };

  const visible = useMemo(() => {
    let list = [...hostels];

    if (filters.types.length) {
      list = list.filter((h) =>
        filters.types.includes(String(h.property_type || '').toLowerCase())
      );
    }
    if (filters.amenities.length) {
      list = list.filter((h) => {
        const has = safeParse(h.amenities);
        return filters.amenities.every((a) => has.includes(a));
      });
    }
    if (filters.minRating) {
      list = list.filter((h) => Number(h.rating) >= filters.minRating);
    }
    if (filters.minPrice || filters.maxPrice) {
      list = list.filter((h) => {
        const p = priceOf(h);
        if (p == null) return true; // don't hide stays with unknown pricing
        if (filters.minPrice && p < Number(filters.minPrice)) return false;
        if (filters.maxPrice && p > Number(filters.maxPrice)) return false;
        return true;
      });
    }

    switch (sort) {
      case 'price_low':
        list.sort((a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity));
        break;
      case 'price_high':
        list.sort((a, b) => (priceOf(b) ?? -1) - (priceOf(a) ?? -1));
        break;
      case 'rating':
        list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      default:
        list.sort(
          (a, b) =>
            (Number(b.rating) || 0) * (Number(b.total_reviews) || 1) -
            (Number(a.rating) || 0) * (Number(a.total_reviews) || 1)
        );
    }
    return list;
  }, [hostels, filters, sort]);

  const searchQuery = params.toString();

  return (
    <div className="app-shell tz-page">
      <PublicNavbar />

      {/* Sticky compact search — the same dock from the landing page */}
      <div className="tz-dockbar">
        <div className="tz-container">
          <SearchDock compact initial={query} onSearch={onSearch} />
        </div>
      </div>

      <div className="tz-container tz-results-layout">
        {/* Sidebar filters */}
        <aside className="tz-filters">
          <div className="tz-filters-head">
            <h3>Filter by</h3>
            {activeFilterCount > 0 && (
              <button className="tz-linkbtn" onClick={clearFilters}>
                <X size={13} /> Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="tz-filter-group">
            <label className="tz-filter-title">Price per night (Rs)</label>
            <div className="tz-price-inputs">
              <input
                type="number"
                placeholder="Min"
                min={0}
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Max"
                min={0}
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="tz-filter-group">
            <label className="tz-filter-title">Property type</label>
            <div className="tz-chiprow">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`tz-chip ${filters.types.includes(t) ? 'tz-chip--on' : ''}`}
                  onClick={() => toggle('types', t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="tz-filter-group">
            <label className="tz-filter-title">Guest rating</label>
            <div className="tz-chiprow">
              {RATING_STEPS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`tz-chip ${filters.minRating === r ? 'tz-chip--on' : ''}`}
                  onClick={() =>
                    setFilters({ ...filters, minRating: filters.minRating === r ? null : r })
                  }
                >
                  {r}+
                </button>
              ))}
            </div>
          </div>

          <div className="tz-filter-group">
            <label className="tz-filter-title">Amenities</label>
            <div className="tz-chiprow">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={`tz-chip ${filters.amenities.includes(a.key) ? 'tz-chip--on' : ''}`}
                  onClick={() => toggle('amenities', a.key)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="tz-results">
          <div className="tz-results-head">
            <div>
              <h1 className="tz-results-title">
                {query.city ? `Stays in ${query.city}` : 'Find your perfect stay'}
              </h1>
              <p className="tz-results-sub">
                {loading ? 'Searching…' : `${visible.length} propert${visible.length === 1 ? 'y' : 'ies'} found`}
                {query.checkIn && query.checkOut ? ` · ${query.checkIn} → ${query.checkOut}` : ''}
                {query.guests ? ` · ${query.guests} guest${query.guests === '1' ? '' : 's'}` : ''}
              </p>
            </div>
            <div className="tz-results-tools">
              <select
                className="tz-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort results"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price (low → high)</option>
                <option value="price_high">Price (high → low)</option>
                <option value="rating">Top rated</option>
              </select>
              <div className="tz-viewtoggle">
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={15} />
                </button>
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid size={15} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="tz-skeletons">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="tz-skeleton-card" />
              ))}
            </div>
          ) : error ? (
            <div className="tz-empty">
              <h3>Couldn't load stays</h3>
              <p>{error}</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="tz-empty">
              <h3>No stays match your search</h3>
              <p>Try a nearby city, widen your price range, or clear some filters.</p>
              {activeFilterCount > 0 && (
                <button className="tz-btn tz-btn--outline" onClick={clearFilters}>
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'tz-grid' : 'tz-list'}>
              {visible.map((hostel) => (
                <HostelCard
                  key={hostel.id}
                  hostel={hostel}
                  viewMode={viewMode}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
