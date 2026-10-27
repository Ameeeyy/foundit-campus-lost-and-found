import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [distinguishingDetails, setDistinguishingDetails] = useState('');
  const [matches, setMatches] = useState([]);
  const [matchError, setMatchError] = useState('');
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesLoaded, setMatchesLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getListing(id);
        setListing(response.listing);
      } catch (err) {
        setError(err.message || 'Failed to load listing.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const isOwner = user && listing?.createdBy?._id === user.id;

  const handleClaimSubmit = async (event) => {
    event.preventDefault();
    if (!listing) return;

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await api.submitClaim({
        listingId: listing._id,
        explanation,
        distinguishingDetails,
      });
      setMessage('Claim submitted successfully. The listing owner will review it soon.');
      setExplanation('');
      setDistinguishingDetails('');
    } catch (err) {
      setError(err.message || 'Unable to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFindMatches = async () => {
    setLoadingMatches(true);
    setMatchError('');

    try {
      const response = await api.getMatches(listing._id);
      setMatches(response.matches || []);
      setMatchesLoaded(true);
    } catch (err) {
      setMatchError(err.message || 'Unable to find potential matches.');
    } finally {
      setLoadingMatches(false);
    }
  };

  if (loading) return <div className="loading-state">Loading listing…</div>;
  if (error && !listing) return <div className="error-banner">{error}</div>;
  if (!listing) return null;

  return (
    <div className="page-block">
      <div className="listing-hero">
        <div className="listing-hero-thumb">
          {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} /> : <span>📦</span>}
        </div>
        <div className="listing-info">
          <div className="listing-topline">
            <StatusBadge status={listing.status} />
            <span className="listing-type">{listing.type}</span>
          </div>
          <h1>{listing.title}</h1>
          <p className="listing-meta">{listing.category} · {listing.location}</p>
          <p>{listing.description}</p>
          {listing.details && <p>{listing.details}</p>}
          <div className="meta-list">
            <span>Date: {new Date(listing.dateLostOrFound).toLocaleDateString()}</span>
            <span>Reported by: {listing.createdBy?.name || 'Unknown'}</span>
            <span>Claims: {listing.claimCount || 0}</span>
          </div>

          {listing.type === 'FOUND' && listing.status === 'ACTIVE' && !isOwner && (
            user ? (
              <form className="form-stack" onSubmit={handleClaimSubmit}>
                <div className="info-banner">
                  Tell the finder why this item is yours. Include details that are not visible in the listing.
                </div>
                <label>
                  Why do you believe this item is yours?
                  <textarea
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                    minLength={10}
                    maxLength={1000}
                    rows={3}
                    required
                  />
                </label>
                <label>
                  Identifying details
                  <textarea
                    value={distinguishingDetails}
                    onChange={(event) => setDistinguishingDetails(event.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Describe a unique mark, contents, or other proof"
                  />
                </label>
                <button className="button button-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit claim'}
                </button>
              </form>
            ) : (
              <div className="info-banner">
                <Link to="/auth">Log in</Link> to submit a claim for this found item.
              </div>
            )
          )}

          {listing.type === 'FOUND' && isOwner && (
            <div className="info-banner">This is your listing. Review any claims from the My work page.</div>
          )}

          {listing.type === 'LOST' && isOwner && listing.status === 'ACTIVE' && (
            <section className="match-section">
              <div className="info-banner">
                Find active found-item reports that may match this lost item.
              </div>
              <button
                className="button button-primary"
                onClick={handleFindMatches}
                disabled={loadingMatches}
              >
                {loadingMatches ? 'Finding matches…' : 'Find potential matches'}
              </button>
              {matchError && <div className="error-banner">{matchError}</div>}
              {matchesLoaded && matches.length === 0 && (
                <div className="empty-state">
                  <h3>No likely matches yet</h3>
                  <p>Try again later as new found-item reports are added.</p>
                </div>
              )}
              {matches.length > 0 && (
                <div className="claims-list">
                  {matches.map((match) => (
                    <article className="claim-card" key={match._id}>
                      <div className="claim-header">
                        <Link to={`/listing/${match._id}`}><h3>{match.title}</h3></Link>
                        <span className="badge badge-green">{match.matchScore}% match</span>
                      </div>
                      <p>{match.description}</p>
                      <div className="meta-list">
                        <span>{match.category}</span>
                        <span>{match.location}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {message && <div className="success-banner">{message}</div>}
          {error && <div className="error-banner">{error}</div>}
        </div>
      </div>
    </div>
  );
}
