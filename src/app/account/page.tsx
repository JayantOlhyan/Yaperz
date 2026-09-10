/**
 * @page Account
 * @description Customer portal for authentication, order history, saved addresses, and profile details.
 * Connects directly to server-authoritative authentication & account APIs.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, ShoppingBag, MapPin, LogOut, Plus, Trash2, Edit } from 'lucide-react';
import styles from './account.module.css';

interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  marketingConsent: boolean;
  accountStatus: string;
  createdAt: string;
}

interface AddressItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number; // in paise
  createdAt: string;
  items: Array<{
    productTitle: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Account dashboard state
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address form fields
  const [addrFirstName, setAddrFirstName] = useState('');
  const [addrLastName, setAddrLastName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/account/orders');
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch {
      setOrders([]);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/account/addresses');
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses(data.data);
      }
    } catch {
      setAddresses([]);
    }
  };

  // Initial session check
  useEffect(() => {
    let active = true;
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
          fetchOrders();
          fetchAddresses();
        } else {
          setCustomer(null);
        }
      })
      .catch(() => {
        if (active) setCustomer(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Login failed. Please verify credentials.');
        return;
      }

      setCustomer(data.data.customer);
      await Promise.all([fetchOrders(), fetchAddresses()]);
    } catch {
      setErrorMsg('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          password,
          confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Registration failed. Please check your information.');
        return;
      }

      setCustomer(data.data.customer);
      await Promise.all([fetchOrders(), fetchAddresses()]);
    } catch {
      setErrorMsg('Network error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Clean local state regardless
    } finally {
      setCustomer(null);
      setOrders([]);
      setAddresses([]);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      firstName: addrFirstName,
      lastName: addrLastName,
      phone: addrPhone,
      addressLine1: addrLine1,
      addressLine2: addrLine2 || undefined,
      city: addrCity,
      state: addrState,
      postalCode: addrPostalCode,
      country: 'IN',
    };

    try {
      let res;
      if (editingAddressId) {
        res = await fetch(`/api/account/addresses/${editingAddressId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/account/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to save address');
        return;
      }

      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
      await fetchAddresses();
    } catch {
      setErrorMsg('Error saving address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchAddresses();
      }
    } catch {
      setErrorMsg('Failed to delete address');
    }
  };

  const startEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddrFirstName(addr.firstName);
    setAddrLastName(addr.lastName);
    setAddrPhone(addr.phone);
    setAddrLine1(addr.addressLine1);
    setAddrLine2(addr.addressLine2 || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPostalCode(addr.postalCode);
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setAddrFirstName('');
    setAddrLastName('');
    setAddrPhone('');
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('');
    setAddrPostalCode('');
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
          Loading account status...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!customer ? (
        <div className={styles.loginCard}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <LogIn size={40} style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginTop: 12 }}>
              {authMode === 'login' ? 'Account Login' : 'Create Account'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {authMode === 'login'
                ? 'Sign in to access your order history and saved addresses.'
                : 'Join Yaperz for seamless streetwear shopping and order tracking.'}
            </p>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                borderBottom: authMode === 'login' ? '2px solid var(--color-text-primary)' : 'none',
                color: authMode === 'login' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                borderBottom: authMode === 'register' ? '2px solid var(--color-text-primary)' : 'none',
                color: authMode === 'register' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}
            >
              Create Account
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ border: '1px solid var(--color-border)', padding: 12, fontSize: 14 }}
                  placeholder="••••••••"
                />
              </div>

              {errorMsg && <p style={{ fontSize: 12, color: 'var(--color-error)' }}>{errorMsg}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: 'var(--color-text-primary)',
                  color: '#fff',
                  padding: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginTop: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  border: 'none',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ border: '1px solid var(--color-border)', padding: 10, fontSize: 13 }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ border: '1px solid var(--color-border)', padding: 10, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ border: '1px solid var(--color-border)', padding: 10, fontSize: 13 }}
                  placeholder="name@email.com"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ border: '1px solid var(--color-border)', padding: 10, fontSize: 13 }}
                  placeholder="9876543210"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Password (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ border: '1px solid var(--color-border)', padding: 10, fontSize: 13 }}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ border: '1px solid var(--color-border)', padding: 10, fontSize: 13 }}
                  placeholder="••••••••"
                />
              </div>

              {errorMsg && <p style={{ fontSize: 12, color: 'var(--color-error)' }}>{errorMsg}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: 'var(--color-text-primary)',
                  color: '#fff',
                  padding: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginTop: 6,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  border: 'none',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <div className={styles.dashboardHeader}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>
                My Account
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                Welcome back, {customer.firstName} {customer.lastName} ({customer.email})
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                border: '1px solid var(--color-border-dark)',
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>

          <div className={styles.grid}>
            {/* Left column: Order History */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={18} /> Order History
              </h2>

              {orders.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No orders placed yet.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className={styles.card} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{ord.orderNumber}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4, margin: '8px 0' }}>
                      {ord.items.map((item, idx) => (
                        <p key={idx} style={{ margin: 0, fontWeight: 600 }}>
                          {item.productTitle} ({item.size} / {item.color}) × {item.quantity}
                        </p>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12, fontSize: 13 }}>
                      <span>Total: <strong>₹ {(ord.grandTotal / 100).toLocaleString('en-IN')}</strong></span>
                      <span style={{
                        color: ord.status === 'DELIVERED' ? 'var(--color-success)' : 'var(--color-accent)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: 12
                      }}>
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right column: Address Book */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <MapPin size={18} /> Addresses
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => { resetAddressForm(); setEditingAddressId(null); setShowAddressForm(true); }}
                    style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={14} /> Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleSaveAddress} className={styles.card}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="text" placeholder="First Name" required value={addrFirstName} onChange={(e) => setAddrFirstName(e.target.value)} style={{ flex: 1, padding: 10, border: '1px solid var(--color-border)' }} />
                      <input type="text" placeholder="Last Name" required value={addrLastName} onChange={(e) => setAddrLastName(e.target.value)} style={{ flex: 1, padding: 10, border: '1px solid var(--color-border)' }} />
                    </div>
                    <input type="tel" placeholder="Phone Number" required value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} style={{ padding: 10, border: '1px solid var(--color-border)' }} />
                    <input type="text" placeholder="Address Line 1" required value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} style={{ padding: 10, border: '1px solid var(--color-border)' }} />
                    <input type="text" placeholder="Address Line 2 (Optional)" value={addrLine2} onChange={(e) => setAddrLine2(e.target.value)} style={{ padding: 10, border: '1px solid var(--color-border)' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="text" placeholder="City" required value={addrCity} onChange={(e) => setAddrCity(e.target.value)} style={{ flex: 1, padding: 10, border: '1px solid var(--color-border)' }} />
                      <input type="text" placeholder="State" required value={addrState} onChange={(e) => setAddrState(e.target.value)} style={{ flex: 1, padding: 10, border: '1px solid var(--color-border)' }} />
                    </div>
                    <input type="text" placeholder="Postal Code (6 digits)" required value={addrPostalCode} onChange={(e) => setAddrPostalCode(e.target.value)} style={{ padding: 10, border: '1px solid var(--color-border)' }} />

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button
                        type="submit"
                        style={{ flex: 1, padding: 12, backgroundColor: 'var(--color-text-primary)', color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', border: 'none' }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                        style={{ flex: 1, padding: 12, border: '1px solid var(--color-border-dark)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', background: 'none' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : addresses.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No saved delivery addresses.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className={styles.card} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>
                        {addr.firstName} {addr.lastName}
                        {addr.isDefault && (
                          <span style={{ fontSize: 10, backgroundColor: 'var(--color-border)', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>DEFAULT</span>
                        )}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => startEditAddress(addr)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                          title="Edit Address"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                          title="Delete Address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                      {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                      {addr.city}, {addr.state} {addr.postalCode}<br />
                      India | Phone: {addr.phone}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Account tab navigation identifiers
export const ACCOUNT_TABS = ['ORDERS', 'PROFILE', 'ADDRESSES', 'SETTINGS'] as const;

// Default placeholder avatar path
export const DEFAULT_AVATAR_PATH = '/images/default-avatar.png';
