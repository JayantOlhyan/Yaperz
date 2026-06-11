'use client';

import React from 'react';
import styles from '../policy.module.css';

export default function RefundPolicyPage() {
  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Refund Policy</h1>
      <p className={styles.date}>Last updated: June 2026</p>

      <div className={styles.content}>
        <p>
          Once we receive and inspect your returned items at our warehouse, we will process your refund according to the guidelines below.
        </p>

        <h2>1. Inspection & Approval</h2>
        <p>
          All returns undergo a strict quality check by our warehouse team. This process takes 24 to 48 hours from receipt of the shipment. If approved, your refund will be initiated immediately.
        </p>

        <h2>2. Refund Methods</h2>
        <ul>
          <li>
            <strong>Prepaid Orders:</strong> Refunded directly to the original payment method (Credit/Debit Card, Netbanking, UPI, or Wallet) used during checkout.
          </li>
          <li>
            <strong>Cash on Delivery (COD) Orders:</strong> Refunded via bank transfer or UPI. You will be prompted to enter your bank details or UPI ID securely in our returns portal.
          </li>
          <li>
            <strong>Store Credit:</strong> You can choose to receive your refund as a store credit coupon code, valid for 1 year, which is issued instantly.
          </li>
        </ul>

        <h2>3. Timelines</h2>
        <p>
          Once approved, refunds typically take:
        </p>
        <ul>
          <li><strong>UPI:</strong> 1 to 2 business days.</li>
          <li><strong>Netbanking / Cards:</strong> 3 to 5 business days, depending on your bank's processing cycles.</li>
        </ul>

        <h2>4. Non-Refundable Charges</h2>
        <p>
          Initial shipping fees (RS. 150 for orders below RS. 5,000) or Express Shipping fees (RS. 350) are non-refundable unless the return is due to a defective product sent by us.
        </p>
      </div>
    </div>
  );
}
