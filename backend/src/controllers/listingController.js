import Listing from '../models/Listing.js';
import Claim from '../models/Claim.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getPotentialMatches } from '../services/matching.js';

const normalizeFilter = (value) => (typeof value === 'string' ? value.trim() : '');

export const listListings = async (req, res, next) => {
  try {
    const { type, category, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;

    if (search) {
      const value = normalizeFilter(search);
      if (value) {
        query.$or = [
          { title: { $regex: value, $options: 'i' } },
          { description: { $regex: value, $options: 'i' } },
          { location: { $regex: value, $options: 'i' } },
        ];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Listing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email campusId'),
      Listing.countDocuments(query),
    ]);

    return res.json({
      items,
      page: Number(page),
      pages: Math.max(1, Math.ceil(total / Number(limit))),
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('createdBy', 'name email campusId');
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    const claimCount = await Claim.countDocuments({ listing: listing._id });
    return res.json({ listing: { ...listing.toObject(), claimCount } });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const { type, title, description, category, location, dateLostOrFound, details, imageUrl } = req.body;

    if (!type || !title || !description || !category || !location || !dateLostOrFound) {
      return res.status(400).json({ message: 'All required listing fields must be provided.' });
    }

    const normalizedType = String(type).toUpperCase();
    if (!['LOST', 'FOUND'].includes(normalizedType)) {
      return res.status(400).json({ message: 'Listing type must be LOST or FOUND.' });
    }

    const listing = await Listing.create({
      createdBy: req.user.id,
      type: normalizedType,
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      location: String(location).trim(),
      dateLostOrFound: new Date(dateLostOrFound),
      details: String(details || '').trim(),
      imageUrl: String(imageUrl || '').trim(),
    });

    return res.status(201).json({ listing });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const [myListings, myClaims, activeLost, activeFound] = await Promise.all([
      Listing.countDocuments({ createdBy: req.user.id }),
      Claim.countDocuments({ claimant: req.user.id }),
      Listing.countDocuments({ type: 'LOST', status: 'ACTIVE' }),
      Listing.countDocuments({ type: 'FOUND', status: 'ACTIVE' }),
    ]);

    return res.json({
      stats: {
        myListings,
        myClaims,
        activeLost,
        activeFound,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMatches = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('createdBy', 'name');
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only view matches for your own listing.' });
    }

    const allCandidates = await Listing.find({
      _id: { $ne: listing._id },
      type: listing.type === 'LOST' ? 'FOUND' : 'LOST',
      status: 'ACTIVE',
    }).populate('createdBy', 'name email campusId');

    const matches = getPotentialMatches(listing, allCandidates);

    const notifications = await Promise.all(
      matches.map(async (candidate) => {
        const recipient = candidate.createdBy._id || candidate.createdBy;
        return Notification.create({
          recipient,
          eventType: 'POTENTIAL_MATCH',
          relatedListing: listing._id,
          message: `Potential match found for ${listing.title} near ${listing.location}.`,
        });
      })
    );

    return res.json({ matches, notificationsCreated: notifications.length });
  } catch (error) {
    next(error);
  }
};
