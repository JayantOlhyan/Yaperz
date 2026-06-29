'use client';

import React from 'react';
import styles from '../policy.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.date}>Last updated: June 2026</p>

      <div className={styles.content}>
        <p>
          At Yaperz, we are committed to protecting your privacy and security. This Privacy Policy details how we collect, use, and safeguard your personal information when you visit and shop on our website.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect personal information that you provide to us directly, including:
        </p>
        <ul>
          <li><strong>Contact Details:</strong> Your name, email address, phone number, and shipping/billing address.</li>
          <li><strong>Payment Information:</strong> We do not store credit card details. All transactions are securely routed via our PCI-DSS compliant partner gateway (Razorpay).</li>
          <li><strong>Device & Browsing Info:</strong> IP address, browser type, device details, and site usage data collected via cookies and tracking pixels (Google Analytics and Meta Pixel).</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use your personal data to:
        </p>
        <ul>
          <li>Process, ship, and track your orders.</li>
          <li>Send order confirmations, updates, and support messages (via SMS, WhatsApp, and email).</li>
          <li>Personalize your shopping experience and deliver targeted marketing communications (if you have opted-in).</li>
          <li>Prevent fraudulent transactions and secure our systems.</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          We do not sell or lease your personal information to third parties. We share data only with trusted partners necessary to fulfill operations (e.g., shipping carriers like Delhivery, customer support software, and analytics tools).
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement a variety of security measures, including SSL encryption for all data transmissions, to maintain the safety of your personal information.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You have the right to request access to, correction of, or deletion of your personal data stored with us. To make a request, contact our team at <strong>support@yaperz.com</strong>.
        </p>
      </div>
    </div>
  );
}
