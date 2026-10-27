import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ListingCard({ listing }) {
  if (!listing) return null;

  return (
    <article className="listing-card">
      <div className="listing-thumb">
        {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} /> : <span>📦</span>}
      </div>
      <div className="listing-body">
        <div className="listing-topline">
          <StatusBadge status={listing.status} />
          <span className="listing-type">{listing.type}</span>
        </div>
        <h3>{listing.title}</h3>
        <p className="listing-meta">{listing.category} · {listing.location}</p>
        <p className="listing-description">{listing.description}</p>
        <div className="card-footer">
          <span>{new Date(listing.dateLostOrFound).toLocaleDateString()}</span>
          <Link to={`/listing/${listing._id || listing.id}`} className="text-link">View details</Link>
        </div>
      </div>
    </article>
  );
}
