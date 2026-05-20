import { useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'];
const today = new Date().toISOString().split('T')[0];

export default function AddExpenseView({ onAdd }) {
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Food', date: today, note: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd(form);
    setForm({ title: '', amount: '', category: 'Food', date: today, note: '' });
    setErrors({});
  };

  return (
    <div className="form-wrap">
      <h1 className="form-title">Add Expense</h1>
      <p className="form-sub">Record a new expense to your tracker</p>

      <div className="card">
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              placeholder="e.g. Lunch at café"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
            />
            {errors.title && <span style={{ color: 'var(--danger)', fontSize: '0.72rem' }}>{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input
              className="form-input"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => handleChange('amount', e.target.value)}
            />
            {errors.amount && <span style={{ color: 'var(--danger)', fontSize: '0.72rem' }}>{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group full">
            <label className="form-label">Date *</label>
            <input
              className="form-input"
              type="date"
              value={form.date}
              onChange={e => handleChange('date', e.target.value)}
            />
            {errors.date && <span style={{ color: 'var(--danger)', fontSize: '0.72rem' }}>{errors.date}</span>}
          </div>

          <div className="form-group full">
            <label className="form-label">Note (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add any details..."
              value={form.note}
              onChange={e => handleChange('note', e.target.value)}
            />
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          + Add Expense
        </button>
      </div>
    </div>
  );
}
