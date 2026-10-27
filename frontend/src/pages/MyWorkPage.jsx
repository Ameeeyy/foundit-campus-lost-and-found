import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const getId = (value) => (typeof value === 'string' ? value : value?._id);

export default function MyWorkPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workingClaimId, setWorkingClaimId] = useState('');

  const loadClaims = useCallback(async () => {
    setError('');
    try {
      const response = await api.getClaims();
      setClaims(response.claims || []);
    } catch (err) {
      setError(err.message || 'Unable to load your claims.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const reviewClaim = async (claimId, status) => {
    setWorkingClaimId(claimId);
    setError('');
    try {
      await api.reviewClaim(claimId, { status });
      await loadClaims();
    } catch (err) {
      setError(err.message || 'Unable to review this claim.');
    } finally {
      setWorkingClaimId('');
    }
  };

  const confirmReturn = async (claimId) => {
    setWorkingClaimId(claimId);
    setError('');
    try {
      await api.confirmReturn({ claimId });
      await loadClaims();
    } catch (err) {
      setError(err.message || 'Unable to confirm the return.');
    } finally {
      setWorkingClaimId('');
    }
  };

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <span className="eyebrow">My work</span>
          <h1>Claims and activity</h1>
        </div>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {loading ? (
        <div className="loading-state">Loading your work…</div>
      ) : claims.length === 0 ? (
        <EmptyState title="No claims yet" description="Claims you submit or receive on your listings will appear here." />
      ) : (
        <div className="claims-list">
          {claims.map((claim) => {
            const isClaimant = getId(claim.claimant) === user?.id;
            const isOwner = !isClaimant;
            const isWorking = workingClaimId === claim._id;

            return (
              <article key={claim._id} className="claim-card">
                <div className="claim-header">
                  <h3>{claim.listing?.title || 'Listing'}</h3>
                  <StatusBadge status={claim.status} />
                </div>
                <p>{claim.explanation}</p>
                {claim.distinguishingDetails && (
                  <p><strong>Identifying details:</strong> {claim.distinguishingDetails}</p>
                )}
                <div className="meta-list">
                  <span>Submitted {new Date(claim.createdAt).toLocaleDateString()}</span>
                  <span>{isOwner ? `Claimed by ${claim.claimant?.name || 'a user'}` : 'Submitted by you'}</span>
                </div>
                {claim.reviewReason && <p><strong>Review note:</strong> {claim.reviewReason}</p>}

                {isOwner && claim.status === 'PENDING' && (
                  <div className="claim-actions">
                    <button
                      className="button button-primary"
                      onClick={() => reviewClaim(claim._id, 'APPROVED')}
                      disabled={isWorking}
                    >
                      {isWorking ? 'Saving…' : 'Approve claim'}
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => reviewClaim(claim._id, 'REJECTED')}
                      disabled={isWorking}
                    >
                      Reject claim
                    </button>
                  </div>
                )}

                {isOwner && claim.status === 'APPROVED' && claim.listing?.status !== 'RETURNED' && (
                  <button
                    className="button button-primary"
                    onClick={() => confirmReturn(claim._id)}
                    disabled={isWorking}
                  >
                    {isWorking ? 'Saving…' : 'Confirm item returned'}
                  </button>
                )}

                {!isOwner && claim.status === 'APPROVED' && claim.listing?.status !== 'RETURNED' && (
                  <p className="info-banner">Your claim was approved. The finder still needs to confirm the return.</p>
                )}
                {claim.listing?.status === 'RETURNED' && (
                  <p className="success-banner">The item return has been confirmed.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
