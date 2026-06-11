'use client';

import React, { useState } from 'react';
import { User, LogIn, ShoppingBag, MapPin } from 'lucide-react';

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrors('Please fill in all fields.');
      return;
    }
    setErrors('');
    setIsLoggedIn(true);
  };

  const mockOrders = [
    {
      id: 'YP-882319',
      date: 'June 02, 2026',
      total: 18500,
      status: 'Delivered',
      items: 'Brown Wildloom Heavyweight Hoodie (Size: M)'
    },
    {
      id: 'YP-821903',
      date: 'May 14, 2026',
      total: 3500,
      status: 'Processing',
      items: 'Basics Oversized Tee - Off White (Size: S)'
    }
  ];

  return (
    <div className="container" style={{ padding: '80px 0', maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
      {!isLoggedIn ? (
        <div style={{ maxWidth: 400, margin: '0 auto', border: '1px solid var(--color-border)', padding: 40, backgroundColor: 'var(--color-surface)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <LogIn size={40} style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginTop: 12 }}>
              Account Login
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Sign in to manage orders and saved details.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ border: '1px solid var(--color-border)', padding: 12, fontSize: 14 }}
                placeholder="name@email.com"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ border: '1px solid var(--color-border)', padding: 12, fontSize: 14 }}
                placeholder="••••••••"
              />
            </div>

            {errors && <p style={{ fontSize: 12, color: 'var(--color-error)' }}>{errors}</p>}

            <button
              type="submit"
              style={{
                backgroundColor: 'var(--color-text-primary)',
                color: '#fff',
                padding: 14,
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: 8
              }}
            >
              Sign In
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 24, marginBottom: 40 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>
                My Account
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                Welcome back, {email.split('@')[0]}
              </p>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              style={{ border: '1px solid var(--color-border-dark)', padding: '8px 20px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}
            >
              Log Out
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40 }}>
            {/* Left column: Orders */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={18} /> Order History
              </h2>
              {mockOrders.map((ord) => (
                <div key={ord.id} style={{ border: '1px solid var(--color-border)', padding: 20, backgroundColor: 'var(--color-surface)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{ord.id}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{ord.date}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{ord.items}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12, fontSize: 13 }}>
                    <span>Total: <strong>RS. {ord.total.toLocaleString('en-IN')}</strong></span>
                    <span style={{
                      color: ord.status === 'Delivered' ? 'var(--color-success)' : 'var(--color-accent)',
                      fontWeight: 700
                    }}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column: Address */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} /> Default Address
              </h2>
              <div style={{ border: '1px solid var(--color-border)', padding: 20, backgroundColor: 'var(--color-surface)' }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{email.split('@')[0]}</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                  M-81, Block M, GK-II<br />
                  New Delhi, Delhi 110048<br />
                  India
                </p>
                <button style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid var(--color-text-primary)', marginTop: 16 }}>
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
