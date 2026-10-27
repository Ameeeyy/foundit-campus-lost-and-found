import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    explanation: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    distinguishingDetails: { type: String, default: '', trim: true, maxlength: 500 },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewReason: { type: String, default: '', maxlength: 500 },
    returnConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    returnConfirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

claimSchema.index({ listing: 1, claimant: 1, status: 1 });

export default mongoose.model('Claim', claimSchema);
