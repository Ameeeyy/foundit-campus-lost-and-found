import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const initialState = {
  type: 'LOST',
  title: '',
  description: '',
  category: 'Water bottles',
  location: '',
  dateLostOrFound: '',
  details: '',
  imageUrl: '',
};

export default function ReportPage() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.createListing(form);
      navigate('/browse');
    } catch (err) {
      setError(err.message || 'Unable to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-block">
      <div className="page-header narrow">
        <div>
          <span className="eyebrow">New report</span>
          <h1>Report a lost or found item</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card form-stack">
        <div className="info-banner">
          Anyone can report a lost item or a found item. If a finder matches a lost item, the rightful owner can submit a claim and the owner can approve or reject it.
        </div>
        <div className="form-row two-columns">
          <label>
            Report type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="LOST">Lost item</option>
              <option value="FOUND">Found item</option>
            </select>
          </label>
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="Electronics">Electronics</option>
              <option value="ID cards and documents">ID cards and documents</option>
              <option value="Bags and wallets">Bags and wallets</option>
              <option value="Books and stationery">Books and stationery</option>
              <option value="Clothing and accessories">Clothing and accessories</option>
              <option value="Keys">Keys</option>
              <option value="Water bottles">Water bottles</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <label>
          Item title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} required />
        </label>

        <div className="form-row two-columns">
          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} required />
          </label>
          <label>
            Date
            <input type="date" name="dateLostOrFound" value={form.dateLostOrFound} onChange={handleChange} required />
          </label>
        </div>

        <label>
          Extra details
          <textarea name="details" value={form.details} onChange={handleChange} rows={3} />
        </label>

        <label>
          Image URL (optional)
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </label>

        {error && <div className="error-banner">{error}</div>}

        <button className="button button-primary" type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
