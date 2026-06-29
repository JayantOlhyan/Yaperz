'use client';

import React from 'react';
import styles from '../policy.module.css';

export default function ReturnsPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <h1 className={styles.title}>Returns & Exchanges</h1>
      <p className={styles.date}>Last updated: June 2026</p>

      <div className={styles.content}>
        <p>
          We want you to love your streetwear. If a fit isn't right, we offer hassle-free returns and exchanges within 7 days of delivery.
        </p>

        <h2>1. Return & Exchange Window</h2>
        <p>
          You have 7 calendar days from the date of delivery to request a return or exchange for your items.
        </p>

        <h2>2. Condition of Items</h2>
        <p>
          To be eligible for a return or exchange, your items must be:
        </p>
        <ul>
          <li>Unworn, unwashed, and in original brand-new condition.</li>
          <li>Accompanied by all original tags, labels, and packaging intact.</li>
          <li>Free of any marks, perfumes, make-up, or deodorant stains.</li>
        </ul>

        <h2>3. How to Start a Request</h2>
        <p>
          Simply visit our returns portal at <strong>returns.yaperz.com</strong> or email us at <strong>support@yaperz.com</strong> with your Order ID and mobile number to request a pickup. Our courier partner will pick up the package from your address.
        </p>

        <h2>4. Exchanges</h2>
        <p>
          Exchanges are subject to size and product availability. If your requested size is out of stock, we will issue store credit or process a refund.
        </p>

        <h2>5. Non-Returnable Items</h2>
        <p>
          For hygiene reasons, accessories (such as caps, socks, beanies) and custom drops marked as Final Sale cannot be returned or exchanged.
        </p>
      </div>
    </div>
  );
}
