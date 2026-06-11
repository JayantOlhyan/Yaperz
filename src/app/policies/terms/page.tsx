'use client';

import React from 'react';
import styles from '../policy.module.css';

export default function TermsOfServicePage() {
  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.date}>Last updated: June 2026</p>

      <div className={styles.content}>
        <p>
          Welcome to Yaperz. By accessing or using our website and purchasing our products, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
        </p>

        <h2>1. Account & Registration</h2>
        <p>
          To purchase certain products or access premium features, you may be required to register an account. You are responsible for maintaining the confidentiality of your account credentials and passwords, and for restricting access to your device.
        </p>

        <h2>2. Product Availability & Orders</h2>
        <p>
          All orders are subject to acceptance and product availability. Because we release clothing via limited drops, we reserve the right to limit quantities purchased per customer or cancel orders that exceed purchase limits. In the event of a cancellation, you will be refunded promptly.
        </p>

        <h2>3. Pricing & Payments</h2>
        <p>
          All prices listed on our website are in Indian Rupees (INR) and include GST unless stated otherwise. We reserve the right to modify prices or discontinue items at any time without notice. Payments must be made via our accepted gateways during checkout.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          All content included on this site, such as designs, logos, graphics, text, images, and brand assets, is the sole property of Yaperz Clothing Pvt. Ltd. and is protected by Indian and international copyright and trademark laws.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          Yaperz shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or services, even if we have been advised of the possibility of such damages.
        </p>

        <h2>6. Governing Law</h2>
        <p>
          These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of India, and disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi.
        </p>
      </div>
    </div>
  );
}
