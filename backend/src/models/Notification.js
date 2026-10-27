import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventType: { type: String, enum: ['POTENTIAL_MATCH', 'CLAIM_SUBMITTED', 'CLAIM_REVIEWED', 'RETURN_CONFIRMED', 'GENERAL'], default: 'GENERAL' },
    relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
    relatedClaim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', default: null },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
