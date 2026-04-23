import { useState, useEffect } from 'react';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function BudgetSettings({ summary, onSave }) {
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (summary?.budget) setInput(summary.budget.toString());
  }, [summary]);

  const handleSave = () => {
    if (!input || isNaN(input) || Number(input) < 0) return;
    onSave(input);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const budget = summary?.budget || 0;
  const spent = summary?.totalThisMonth || 0;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const barClass = pct < 70 ? 'safe' : pct < 90 ? 'warn' : 'over';

  return (
    <div className="budget-wrap">
      <h1 className="page-title">Budget</h1>
      <p className="page-sub">Set and track your monthly spending limit</p>

      <div className="budget-big">
        <div className="budget-spent">{fmt(spent)}</div>
        <div className="budget-of">spent this month {budget > 0 ? `out of ${fmt(budget)}` : ''}</div>

        {budget > 0 && (
          <div className="budget-bar-wrap">
            <div className="budget-bar-track">
              <div className={`budget-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text2)', marginTop: '0.4rem' }}>
              <span>{Math.round(pct)}% used</span>
              <span style={{ color: barClass === 'over' ? 'var(--danger)' : 'var(--accent3)' }}>
                {barClass === 'over'
                  ? `⚠ Over by ${fmt(spent - budget)}`
                  : `${fmt(budget - spent)} remaining`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Set Monthly Budget</div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Budget Amount (₹)</label>
          <input
            className="form-input"
            type="number"
            min="0"
            placeholder="Enter monthly limit"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <button className="submit-btn" onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Budget'}
        </button>
      </div>

      {budget > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-title">Summary</div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              { label: 'Monthly Budget', value: fmt(budget), color: 'var(--accent)' },
              { label: 'Spent This Month', value: fmt(spent), color: 'var(--accent2)' },
              { label: 'Remaining', value: fmt(Math.max(budget - spent, 0)), color: 'var(--accent3)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>{row.label}</span>
                <span style={{ color: row.color, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
