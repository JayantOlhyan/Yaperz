'use client';

import React from 'react';
import styles from '../policy.module.css';

export default function ShippingPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <h1 className={styles.title}>Shipping Policy</h1>
      <p className={styles.date}>Last updated: June 2026</p>

      <div className={styles.content}>
        <p>
          We aim to process and ship your orders as quickly as possible. Please review our shipping practices and timelines below.
        </p>

        <h2>1. Delivery Areas</h2>
        <p>
          We deliver to all locations across India. Currently, we do not support international shipping. All shipments are dispatched from our warehouse in New Delhi.
        </p>

        <h2>2. Shipping Charges & Methods</h2>
        <ul>
          <li>
            <strong>Standard Shipping:</strong> Free for all orders above RS. 5,000. For orders under RS. 5,000, a flat shipping fee of RS. 150 applies. Delivery takes 3 to 5 business days.
          </li>
          <li>
            <strong>Express Shipping:</strong> Available at checkout for a flat fee of RS. 350. Delivery takes 1 to 2 business days (available in select metros).
          </li>
        </ul>

        <h2>3. Processing Times</h2>
        <p>
          Orders placed before 2:00 PM are processed and shipped on the same business day. Orders placed after 2:00 PM or on Sundays/Public Holidays will be processed on the next business day.
        </p>

        <h2>4. Logistics Partners</h2>
        <p>
          We partner with leading logistics carriers including Delhivery, Shiprocket, Blue Dart, and Xpressbees to ensure safe and prompt delivery of your streetwear.
        </p>

        <h2>5. Damaged Shipments</h2>
        <p>
          If your package arrives damaged or tampered with, please do not accept the shipment and contact our customer support team immediately at <strong>support@yaperz.com</strong> or via WhatsApp.
        </p>
      </div>
    </div>
  );
}
