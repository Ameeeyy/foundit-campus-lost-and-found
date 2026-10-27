import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['LOST', 'FOUND'], required: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    category: { type: String, enum: ['Electronics', 'ID cards and documents', 'Bags and wallets', 'Books and stationery', 'Clothing and accessories', 'Keys', 'Water bottles', 'Other'], required: true },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    dateLostOrFound: { type: Date, required: true },
    imageUrl: { type: String, default: '' },
    details: { type: String, default: '', trim: true, maxlength: 500 },
    status: { type: String, enum: ['ACTIVE', 'CLAIM_PENDING', 'RETURNED', 'CLOSED'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

listingSchema.index({ type: 1, status: 1, createdAt: -1 });
listingSchema.index({ category: 1, location: 1 });
listingSchema.index({ title: 'text', description: 'text', location: 'text' });

export default mongoose.model('Listing', listingSchema);
