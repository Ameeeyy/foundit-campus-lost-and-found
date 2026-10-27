import Claim from '../models/Claim.js';
import Listing from '../models/Listing.js';
import Notification from '../models/Notification.js';

export const submitClaim = async (req, res, next) => {
  try {
    const { listingId, explanation, distinguishingDetails } = req.body;

    if (!listingId || !explanation) {
      return res.status(400).json({ message: 'Listing and claim explanation are required.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (listing.type !== 'FOUND' || listing.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Only active found-item listings can be claimed.' });
    }

    if (listing.createdBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot claim your own listing.' });
    }

    const existingClaim = await Claim.findOne({ listing: listingId, claimant: req.user.id, status: { $in: ['PENDING', 'APPROVED'] } });
    if (existingClaim) {
      return res.status(409).json({ message: 'You already submitted a claim for this listing.' });
    }

    const claim = await Claim.create({
      listing: listingId,
      claimant: req.user.id,
      explanation,
      distinguishingDetails: distinguishingDetails || '',
      status: 'PENDING',
    });

    await Notification.create({
      recipient: listing.createdBy,
      eventType: 'CLAIM_SUBMITTED',
      relatedListing: listing._id,
      relatedClaim: claim._id,
      message: `A new claim was submitted for ${listing.title}.`,
    });

    return res.status(201).json({ claim });
  } catch (error) {
    next(error);
  }
};

export const listClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({
      $or: [{ claimant: req.user.id }, { listing: { $in: await Listing.find({ createdBy: req.user.id }).distinct('_id') } }],
    }).populate('listing').populate('claimant', 'name email');

    return res.json({ claims });
  } catch (error) {
    next(error);
  }
};

export const reviewClaim = async (req, res, next) => {
  try {
    const { status, reviewReason } = req.body;
    const claim = await Claim.findById(req.params.id).populate('listing').populate('claimant');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const listing = await Listing.findById(claim.listing._id);
    if (!listing || listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only review claims for your own listing.' });
    }

    if (claim.status !== 'PENDING') {
      return res.status(409).json({ message: 'Only pending claims can be reviewed.' });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Review status must be APPROVED or REJECTED.' });
    }

    if (status === 'APPROVED' && listing.status !== 'ACTIVE') {
      return res.status(409).json({ message: 'This listing already has an approved claim or is no longer active.' });
    }

    claim.status = status;
    claim.reviewedBy = req.user.id;
    claim.reviewReason = reviewReason || '';
    if (status === 'APPROVED') listing.status = 'CLAIM_PENDING';
    await Promise.all([claim.save(), ...(status === 'APPROVED' ? [listing.save()] : [])]);

    await Notification.create({
      recipient: claim.claimant,
      eventType: 'CLAIM_REVIEWED',
      relatedClaim: claim._id,
      relatedListing: claim.listing._id,
      message: `Your claim for ${claim.listing.title} was ${status.toLowerCase()}.`,
    });

    return res.json({ claim });
  } catch (error) {
    next(error);
  }
};

export const confirmReturn = async (req, res, next) => {
  try {
    const { claimId } = req.body;
    const claim = await Claim.findById(claimId).populate('listing').populate('claimant');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const listing = await Listing.findById(claim.listing._id);
    if (!listing || listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the listing owner can confirm a return.' });
    }

    if (claim.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Only approved claims can be confirmed.' });
    }

    if (claim.returnConfirmedAt || !['ACTIVE', 'CLAIM_PENDING'].includes(listing.status)) {
      return res.status(409).json({ message: 'This item has already been returned or closed.' });
    }

    listing.status = 'RETURNED';
    claim.returnConfirmedBy = req.user.id;
    claim.returnConfirmedAt = new Date();
    await Promise.all([listing.save(), claim.save()]);

    await Notification.create({
      recipient: claim.claimant,
      eventType: 'RETURN_CONFIRMED',
      relatedClaim: claim._id,
      relatedListing: claim.listing._id,
      message: `The return for ${claim.listing.title} has been confirmed.`,
    });

    return res.json({ listing, claim });
  } catch (error) {
    next(error);
  }
};
