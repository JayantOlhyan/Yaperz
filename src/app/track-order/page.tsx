'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isTracked, setIsTracked] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) {
      setError('Please fill in both fields.');
      return;
    }
    setError('');
    setIsTracked(true);
  };

  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Track Your Order</h1>
      <p className={styles.subtitle}>Enter your details below to check the real-time shipping status of your drop.</p>

      <form onSubmit={handleTrack} className={styles.form}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Order ID</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className={styles.input}
            placeholder="e.g. YP-100234"
          />
        </div>

        <div className={styles.inputWrapper}>
          <label className={styles.label}>Phone Number or Email</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={styles.input}
            placeholder="e.g. 9876543210"
          />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <button type="submit" className={styles.submitBtn}>
          Track Order
        </button>
      </form>

      {isTracked && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <span className={styles.orderId}>Order ID: {orderId}</span>
            <span className={styles.status} style={{ color: 'var(--color-success)' }}>
              In Transit
            </span>
          </div>

          <div className={styles.timeline}>
            <div className={`${styles.step} ${styles.stepDone}`}>
              <div className={styles.node} />
              <span className={styles.stepTitle}>Order Confirmed</span>
              <span className={styles.stepDesc}>Your order was registered and verified successfully.</span>
            </div>

            <div className={`${styles.step} ${styles.stepDone}`}>
              <div className={styles.node} />
              <span className={styles.stepTitle}>Dispatched</span>
              <span className={styles.stepDesc}>Package handed over to Delhivery logistics in New Delhi.</span>
            </div>

            <div className={`${styles.step} ${styles.stepActive}`}>
              <div className={styles.node} />
              <span className={styles.stepTitle}>In Transit</span>
              <span className={styles.stepDesc}>Package arrived at delivery hub. Out for delivery soon.</span>
            </div>

            <div className={styles.step}>
              <div className={styles.node} />
              <span className={styles.stepTitle}>Out for Delivery</span>
              <span className={styles.stepDesc}>Delivery executive will deliver to your address today.</span>
            </div>

            <div className={styles.step}>
              <div className={styles.node} />
              <span className={styles.stepTitle}>Delivered</span>
              <span className={styles.stepDesc}>Package successfully received.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
