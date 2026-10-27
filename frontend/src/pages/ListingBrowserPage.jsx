import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ListingCard from '../components/ListingCard';
import EmptyState from '../components/EmptyState';

export default function ListingBrowserPage() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: 'all', category: 'all', search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadListings = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getListings({
        type: nextFilters.type,
        category: nextFilters.category,
        search: nextFilters.search,
      });
      setItems(response.items || []);
    } catch (err) {
      setError(err.message || 'Unable to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    loadListings(nextFilters);
  };

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <span className="eyebrow">Browse</span>
          <h1>Recent campus listings</h1>
        </div>
      </div>

      <div className="filter-bar">
        <select name="type" value={filters.type} onChange={onFilterChange}>
          <option value="all">All types</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
        <select name="category" value={filters.category} onChange={onFilterChange}>
          <option value="all">All categories</option>
          <option value="Electronics">Electronics</option>
          <option value="ID cards and documents">ID cards and documents</option>
          <option value="Bags and wallets">Bags and wallets</option>
          <option value="Books and stationery">Books and stationery</option>
          <option value="Clothing and accessories">Clothing and accessories</option>
          <option value="Keys">Keys</option>
          <option value="Water bottles">Water bottles</option>
          <option value="Other">Other</option>
        </select>
        <input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search by title, location, keyword" />
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {loading ? (
        <div className="loading-state">Loading listings…</div>
      ) : error ? null : items.length === 0 ? (
        <EmptyState title="No listings found" description="Try adjusting the filters or check back later." />
      ) : (
        <div className="listing-grid">
          {items.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
