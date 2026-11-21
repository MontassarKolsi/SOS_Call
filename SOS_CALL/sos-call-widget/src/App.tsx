
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const params = new URLSearchParams(window.location.search);
const ORDER_AMOUNT = Number(params.get('orderAmount') || 368000); // millimes
const MERCHANT_SLUG = params.get('merchantSlug') || 'demo-shop';
const INCREMENT = 1000;

const foodItems = ['🍞', '🥛', '🍎', '🥫', '🥖', '🥕', '🧃', '🍪'];

const encouragements = [
  'Every contribution makes a difference!',
  'A little more kindness goes a long way!',
  'Your generosity can brighten a child’s day!',
  'Together, we can make a bigger difference!',
  'Look how much good you can do!',
  'Your kindness means more than you imagine!',
];

function App() {
  const [amount, setAmount] = useState(0);
  const [suggestedDonation, setSuggestedDonation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('Every contribution makes a difference!');

  useEffect(() => {
    fetch(`${API_URL}/donations/quote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderAmount: ORDER_AMOUNT }) })
      .then(r => { if (!r.ok) throw new Error('Could not calculate donation'); return r.json(); })
      .then(q => { setSuggestedDonation(q.suggestedDonation); setAmount(q.suggestedDonation); if (!q.eligible) setError('This order is not eligible for SOS-Call (minimum 7.001 TND).'); })
      .catch(() => setError('Cannot reach SOS-Call server. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const foodCount = Math.min(
    Math.floor(amount / 5000),
    foodItems.length
  );

  const handleIncrease = () => {
    const nextAmount = amount + INCREMENT;
    setAmount(nextAmount);

    const messageIndex = Math.min(
      Math.floor(nextAmount / 10000),
      encouragements.length - 1
    );

    setMessage(encouragements[messageIndex]);

    confetti({
      particleCount: 25,
      spread: 55,
      origin: { y: 0.65 },
      scalar: 0.8,
      startVelocity: 25,
    });

    if (nextAmount % 20000 === 0) {
      confetti({
        particleCount: 65,
        spread: 90,
        origin: { y: 0.65 },
      });
    }
  };

  const handleDecrease = () => {
    setAmount((previous) => Math.max(0, previous - INCREMENT));
    setMessage('Every little bit of kindness counts!');
  };

  const handleConfirm = async () => {
    if (amount <= 0 || loading) return;
    setError('');
    try {
      const response = await fetch(`${API_URL}/donations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantSlug: MERCHANT_SLUG, orderAmount: ORDER_AMOUNT, donationAmount: amount }),
      });
      const donation = await response.json();
      if (!response.ok) throw new Error(donation.message || 'Could not create donation');
      window.parent.postMessage({ type: 'SOS_DONATION_SELECTED', donationId: donation.id, donationAmount: amount }, '*');
      setConfirmed(true);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
  };

  const handleDecline = () => {
    window.parent.postMessage({ type: 'SOS_DONATION_DECLINED' }, '*');
  };

  const handleReset = () => {
    setAmount(suggestedDonation);
    setConfirmed(false);
    setMessage(encouragements[0]);
  };

  return (
    <main className="page">
      <section className="donation-card">

        {loading ? <div className="success-screen"><h2>Preparing your contribution…</h2></div> : !confirmed ? (
          <>
            {/* Header */}
            <header className="header">
              <div className="brand">
                <div className="brand-icon">♥</div>
                <div>
                  <h1>SOS <span>Children's Villages</span></h1>
                  <p>Tunisia</p>
                </div>
              </div>

              <span className="secure-label">
                <span className="secure-dot" />
                Secure donation
              </span>
            </header>

            {/* Introduction */}
            <div className="introduction">
              <span className="eyebrow">A LITTLE GESTURE, A BIG IMPACT</span>

              <h2>
                Make someone's world
                <span> a little brighter.</span>
              </h2>

              <p>
                Add a small contribution to your purchase
                and help children build a better future.
              </p>
            </div>

            {/* Illustration */}
            <div className="illustration-section">
              <div className="illustration-glow" />

              <div className="basket">
                <div className="basket-items">
                  {foodItems.slice(0, foodCount).map((item, index) => (
                    <span
                      key={index}
                      className="food-item"
                      style={{
                        animationDelay: `${index * 70}ms`,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="basket-body">
                  <div className="basket-lines" />
                </div>
              </div>

              <span className="illustration-caption">
                {amount === 0
                  ? 'Your kindness can start here'
                  : foodCount >= foodItems.length
                    ? 'Look at all the good you can do!'
                    : 'Every contribution adds something special'}
              </span>
            </div>

            {/* Donation controls */}
            <div className="donation-section">

              <div className="suggestion-label">
                <span>Your suggested contribution</span>
                <span className="suggestion-badge">2.5% of your order</span>
              </div>

              <div className="amount-selector">
                <button
                  className="amount-button"
                  onClick={handleDecrease}
                  disabled={amount === 0 || Boolean(error && error.includes('not eligible'))}
                  aria-label="Decrease donation"
                >
                  −
                </button>

                <div className="amount-display" key={amount}>
                  <span className="currency">TND</span>
                  <strong>{(amount / 1000).toFixed(3)}</strong>
                </div>

                <button
                  className="amount-button increase"
                  onClick={handleIncrease}
                  aria-label="Increase donation"
                >
                  +
                </button>
              </div>

              <div className="encouragement" key={message}>
                <span>👏</span>
                {message}
              </div>

              {/* Quick selection */}
              <div className="quick-amounts">
                {[1000, 2000, 5000, 10000].map((value) => (
                  <button
                    key={value}
                    className={amount === value ? 'quick-active' : ''}
                    onClick={() => {
                      setAmount(value);
                      setMessage('Thank you for your generosity!');
                    }}
                  >
                    +{(value / 1000).toFixed(0)} TND
                  </button>
                ))}
              </div>

              <button
                className="confirm-button"
                onClick={handleConfirm}
                disabled={amount === 0 || Boolean(error && error.includes('not eligible'))}
              >
                <span>Yes, I want to contribute</span>
                <span className="button-arrow">→</span>
              </button>

              <button className="decline-button" onClick={handleDecline}>
                No thanks, continue without donating
              </button>

              {error && <p className="disclaimer" role="alert">{error}</p>}
              <p className="disclaimer">
                Your contribution will be added to your order.
                Every millime counts.
              </p>
            </div>

            {/* Footer */}
            <footer className="footer">
              <span>Made with ♥ for children in Tunisia</span>
              <span>Powered by SOS Tunisia</span>
            </footer>
          </>
        ) : (
          /* Success screen */
          <div className="success-screen">
            <div className="success-icon">♥</div>

            <span className="eyebrow">THANK YOU FOR YOUR KINDNESS</span>

            <h2>
              You just made
              <span> a difference!</span>
            </h2>

            <p>
              Your contribution of
              <strong> {(amount / 1000).toFixed(3)} TND </strong>
              will help support children in need.
            </p>

            <div className="success-amount">
              {(amount / 1000).toFixed(3)} <span>TND</span>
            </div>

            <div className="success-message">
              Every small gesture brings us closer to a better future.
              Thank you for being part of it!
            </div>

            <button className="confirm-button" onClick={handleReset}>
              Back to donation widget
              <span className="button-arrow">→</span>
            </button>

            <footer className="footer">
              Made with ♥ for children in Tunisia
            </footer>
          </div>
        )}

      </section>

      {/* Demo information */}
      <div className="demo-info">
        <span>LIVE DEMO</span>
        Order amount: <strong>{(ORDER_AMOUNT / 1000).toFixed(3)} TND</strong>
        <span>·</span>
        Suggested: <strong>{(suggestedDonation / 1000).toFixed(3)} TND</strong>
      </div>
    </main>
  );
}

export default App;
