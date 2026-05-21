const CATEGORIES = ['All', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'];

const CAT_COLORS = {
  Food: '#f76a8c', Transport: '#6af7c8', Entertainment: '#7c6af7',
  Shopping: '#f7c06a', Health: '#6af7f7', Education: '#c86af7', Other: '#8888aa'
};

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function ExpenseList({ expenses, filter, setFilter, onDelete, loading }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <h1 className="page-title">Expenses</h1>
      <p className="page-sub">Track and manage your spending</p>

      <div className="filters-bar">
        <select
          className="filter-select"
          value={filter.category}
          onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input
          type="month"
          className="filter-input"
          value={filter.month}
          onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}
        />
        {(filter.category !== 'All' || filter.month) && (
          <button
            className="delete-btn"
            onClick={() => setFilter({ category: 'All', month: '' })}
          >
            ✕ Clear
          </button>
        )}
        {expenses.length > 0 && (
          <span style={{ marginLeft: 'auto', color: 'var(--text2)', fontSize: '0.8rem' }}>
            {expenses.length} record{expenses.length !== 1 ? 's' : ''} · Total: <strong style={{ color: 'var(--accent2)' }}>{fmt(total)}</strong>
          </span>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div style={{ color: 'var(--text2)', marginBottom: '0.5rem' }}>No expenses found</div>
            <div style={{ fontSize: '0.78rem' }}>Add your first expense to get started</div>
          </div>
        ) : (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e._id} className="expense-row">
                  <td>
                    <div className="expense-title">{e.title}</div>
                    {e.note && <div className="expense-note">{e.note}</div>}
                  </td>
                  <td>
                    <span className="cat-badge">
                      <span className="cat-dot" style={{ background: CAT_COLORS[e.category] || '#8888aa' }} />
                      {e.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: '0.78rem' }}>
                    {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span className="expense-amount">{fmt(e.amount)}</span>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => onDelete(e._id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
