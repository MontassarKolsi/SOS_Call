
import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api/v1';

type Donation = {
  id: string;
  donationAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  merchant: {
    name: string;
  };
};

type Overview = {
  totalCollected: number;
  confirmedDonations: number;
  merchantsCount: number;
  recentDonations: Donation[];
};

function formatMoney(millimes: number) {
  return `${(millimes / 1000).toFixed(3)} TND`;
}

function App() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () => fetch(`${API_URL}/dashboard/overview`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load dashboard data');
        }
        return response.json();
      })
      .then((data: Overview) => { setOverview(data); setError(''); })
      .catch(() => setError('Unable to connect to the server.'))
      .finally(() => setLoading(false));
    load();
    const timer = window.setInterval(load, 3000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return <main className="page-message">Loading dashboard...</main>;
  }

  if (error || !overview) {
    return <main className="page-message error">{error}</main>;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">♥</div>
          <div>
            <strong>SOS Tunisia</strong>
            <span>Donation platform</span>
          </div>
        </div>

        <nav>
          <a className="nav-link active" href="#overview">Overview</a>
          <a className="nav-link" href="#donations">Donations</a>
          <a className="nav-link" href="#merchants">Merchants</a>
          <a className="nav-link" href="#campaigns">Campaigns</a>
        </nav>

        <div className="sidebar-footer">Administration</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SOS TUNISIA / ADMIN</p>
            <h1>Overview</h1>
            <p className="subtitle">
              Here's what's happening with your donations.
            </p>
          </div>
          <div className="admin-avatar">A</div>
        </header>

        <section className="stats-grid" id="overview">
          <article className="stat-card">
            <span className="stat-label">Total collected</span>
            <strong>{formatMoney(overview.totalCollected)}</strong>
            <span className="stat-description">Confirmed donations only</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Confirmed donations</span>
            <strong>{overview.confirmedDonations}</strong>
            <span className="stat-description">Successfully confirmed</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Merchants</span>
            <strong>{overview.merchantsCount}</strong>
            <span className="stat-description">Registered merchants</span>
          </article>
        </section>

        <section className="table-card" id="donations">
          <div className="section-heading">
            <div>
              <h2>Recent donations</h2>
              <p>Confirmed donations only · updates automatically</p>
            </div>
          </div>

          {overview.recentDonations.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">♡</span>
              <strong>No donations yet</strong>
              <p>Donations will appear here once merchants start collecting them.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td>{donation.merchant.name}</td>
                      <td>{formatMoney(donation.donationAmount)}</td>
                      <td>
                        <span className={`status ${donation.status.toLowerCase()}`}>
                          {donation.status}
                        </span>
                      </td>
                      <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
