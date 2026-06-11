'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './page.module.css';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      q: 'How do Yaperz products fit?',
      a: 'Most of our items—especially hoodies, jackets, and t-shirts—are designed for an oversized, boxy silhouette with dropped shoulders. We suggest ordering your true size for the intended streetwear fit, or sizing down if you prefer a more tailored look. Check out the Size Guide on the product pages for exact measurements.'
    },
    {
      q: 'When do collections and new drops launch?',
      a: 'We operate on a limited drop model to maintain exclusivity and prevent waste. Drops are announced on our Instagram handle and via newsletter. Once a drop sells out, it is rarely restocked.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, we offer Cash on Delivery for most PIN codes across India. You can select COD at checkout.'
    },
    {
      q: 'How can I track my order?',
      a: 'Once your order is shipped, we will send you an email and SMS with a tracking number and a carrier link. You can also use our Track Order page with your Order ID to see updates.'
    },
    {
      q: 'What is your exchange and return policy?',
      a: 'We offer exchanges and returns within 7 days of delivery for all unworn garments with original tags attached. You can start a request directly on our returns portal.'
    },
    {
      q: 'Where are your physical walk-in stores?',
      a: 'We have flagship stores in Delhi (GK-II), Mumbai (Khar West), Hyderabad (Banjara Hills), Ahmedabad (Ashok Vatika), and Gurugram (Ambience Island). Visit our Store Locator page for full directions and operating hours.'
    }
  ];

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>
      <p className={styles.subtitle}>Find answers to questions about orders, fits, shipments, and returns.</p>

      <div className={styles.accordions}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.accordion}>
            <button
              onClick={() => toggleAccordion(index)}
              className={styles.header}
            >
              <span className={styles.question}>{faq.q}</span>
              {openIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openIndex === index && (
              <div className={styles.answer}>
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
