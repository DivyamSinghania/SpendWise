import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CAT_COLORS = {
  Food: '#f76a8c',
  Transport: '#6af7c8',
  Entertainment: '#7c6af7',
  Shopping: '#f7c06a',
  Health: '#6af7f7',
  Education: '#c86af7',
  Other: '#8888aa'
};

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function DashboardView({ summary, expenses = [] }) {
  if (!summary) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text3)' }}>
      Loading dashboard...
    </div>
  );

  const { totalThisMonth, totalAll, count, budget, byCategory, trend } = summary;
  const pct = budget > 0 ? Math.min((totalThisMonth / budget) * 100, 100) : 0;
  const remaining = budget > 0 ? budget - totalThisMonth : null;
  const barClass = pct < 70 ? 'safe' : pct < 90 ? 'warn' : 'over';

  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Your spending overview at a glance</p>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-label">This Month</div>
          <div className="stat-value purple">{fmt(totalThisMonth)}</div>
          <div className="stat-sub">{count} total expenses</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-label">All Time</div>
          <div className="stat-value pink">{fmt(totalAll)}</div>
          <div className="stat-sub">since you started tracking</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Budget Left</div>
          <div className="stat-value green">
            {remaining !== null ? fmt(Math.max(remaining, 0)) : '—'}
          </div>
          <div className="stat-sub">{budget > 0 ? `of ${fmt(budget)} budget` : 'no budget set'}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Budget Used</div>
          <div className="stat-value yellow">{budget > 0 ? `${Math.round((totalThisMonth / budget) * 100)}%` : '—'}</div>
          <div className="stat-sub">this month</div>
        </div>
      </div>

      <div className="card recent-transactions-card">
        <div className="card-title">Recent Transactions</div>
        {recentTransactions.length === 0 ? (
          <div className="recent-empty">No recent transactions yet</div>
        ) : (
          <div className="recent-list">
            {recentTransactions.map((expense) => (
              <div key={expense.id} className="recent-item">
                <div className="recent-item-main">
                  <div className="recent-item-title">{expense.title}</div>
                  <div className="recent-item-meta">
                    <span>{expense.category}</span>
                    <span>{new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="recent-item-amount">{fmt(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget bar */}
      {budget > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-title">Monthly Budget Progress</div>
          <div className="budget-bar-wrap">
            <div className="budget-labels">
              <span>Spent: {fmt(totalThisMonth)}</span>
              <span>Budget: {fmt(budget)}</span>
            </div>
            <div className="budget-bar-track">
              <div className={`budget-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: barClass === 'over' ? 'var(--danger)' : 'var(--text3)' }}>
              {barClass === 'over' ? `⚠ Over budget by ${fmt(totalThisMonth - budget)}` : `${Math.round(pct)}% used`}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-title">Spending Trend — Last 6 Months</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#f0f0f8', fontSize: 12 }}
                formatter={v => [fmt(v), 'Spent']}
              />
              <Area type="monotone" dataKey="amount" stroke="#7c6af7" strokeWidth={2} fill="url(#grad1)" dot={{ fill: '#7c6af7', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">By Category — This Month</div>
          {pieData.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: '0.82rem', textAlign: 'center', paddingTop: '2rem' }}>
              No expenses this month
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#8888aa'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#f0f0f8', fontSize: 12 }}
                    formatter={v => [fmt(v)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-list" style={{ marginTop: '0.75rem' }}>
                {pieData.sort((a, b) => b.value - a.value).map(({ name, value }) => (
                  <div key={name} className="cat-row">
                    <span className="cat-dot" style={{ background: CAT_COLORS[name] || '#8888aa' }} />
                    <span className="cat-name">{name}</span>
                    <span className="cat-amount">{fmt(value)}</span>
                    <span className="cat-pct">{Math.round((value / totalThisMonth) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
