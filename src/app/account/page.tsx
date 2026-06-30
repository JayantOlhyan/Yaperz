'use client';

import React, { useState } from 'react';
import { User, LogIn, ShoppingBag, MapPin } from 'lucide-react';
import styles from './account.module.css';

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

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
    <div className={styles.container}>
      {!isLoggedIn ? (
        <div className={styles.loginCard}>
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
                marginTop: 8,
                cursor: 'pointer',
                border: 'none'
              }}
            >
              Sign In
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'var(--color-text-muted)' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
              <span style={{ padding: '0 12px', fontSize: 12, fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
            </div>

            <button
              type="button"
              onClick={() => {
                setEmail('google.user@gmail.com');
                setIsLoggedIn(true);
              }}
              style={{
                backgroundColor: '#fff',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-dark)',
                padding: 14,
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('+91 98765 43210');
                setIsLoggedIn(true);
              }}
              style={{
                backgroundColor: '#fff',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-dark)',
                padding: 14,
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Continue with Phone
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className={styles.dashboardHeader}>
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

          <div className={styles.grid}>
            {/* Left column: Orders */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={18} /> Order History
              </h2>
              {mockOrders.map((ord) => (
                <div key={ord.id} className={styles.card} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{ord.id}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{ord.date}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{ord.items}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12, fontSize: 13 }}>
                    <span>Total: <strong>₹ {ord.total.toLocaleString('en-IN')}</strong></span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <MapPin size={18} /> Addresses
                </h2>
                {!isAddingAddress && !isEditingAddress && (
                  <button 
                    onClick={() => setIsAddingAddress(true)}
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                    + Add New
                  </button>
                )}
              </div>

              {(isEditingAddress || isAddingAddress) ? (
                <div className={styles.card}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                    {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input type="text" placeholder="Full Name" defaultValue={isEditingAddress ? email.split('@')[0] : ''} style={{ padding: 10, border: '1px solid var(--color-border)' }} />
                    <input type="text" placeholder="Address Line 1" defaultValue={isEditingAddress ? 'M-81, Block M, GK-II' : ''} style={{ padding: 10, border: '1px solid var(--color-border)' }} />
                    <input type="text" placeholder="City" defaultValue={isEditingAddress ? 'New Delhi' : ''} style={{ padding: 10, border: '1px solid var(--color-border)' }} />
                    <input type="text" placeholder="Postal Code" defaultValue={isEditingAddress ? '110048' : ''} style={{ padding: 10, border: '1px solid var(--color-border)' }} />
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button 
                        onClick={() => { setIsEditingAddress(false); setIsAddingAddress(false); }}
                        style={{ flex: 1, padding: 12, backgroundColor: 'var(--color-text-primary)', color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                        Save
                      </button>
                      <button 
                        onClick={() => { setIsEditingAddress(false); setIsAddingAddress(false); }}
                        style={{ flex: 1, padding: 12, border: '1px solid var(--color-border-dark)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{email.split('@')[0]} <span style={{ fontSize: 10, backgroundColor: 'var(--color-border)', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>DEFAULT</span></p>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                    M-81, Block M, GK-II<br />
                    New Delhi, Delhi 110048<br />
                    India
                  </p>
                  <button 
                    onClick={() => setIsEditingAddress(true)}
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid var(--color-text-primary)', marginTop: 16 }}>
                    Edit Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
