'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import styles from './page.module.css';

interface StoreLocation {
  city: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string;
  directionsUrl: string;
}

export default function StoreLocatorPage() {
  const stores: StoreLocation[] = [
    {
      city: 'Delhi',
      name: 'Yaperz Flagship GK-II',
      address: 'M-81, Block M, Greater Kailash II, New Delhi 110048',
      phone: '+91 82851 72372',
      email: 'delhi@yaperz.com',
      hours: '11:00 AM - 9:00 PM',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.8123049103986!2d77.2403698762573!3d28.545366487900746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3c4e3650c8d%3A0xc3b8398ff0c31e92!2sGreater%20Kailash%20II%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      directionsUrl: 'https://maps.google.com/?q=M-81,+Block+M,+GK-II,+New+Delhi'
    },
    {
      city: 'Mumbai',
      name: 'Yaperz Khar West',
      address: 'B1, Prem Sagar, 14th Road, Khar West, Mumbai 400052',
      phone: '+91 95991 99537',
      email: 'mumbai@yaperz.com',
      hours: '11:00 AM - 9:30 PM',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.835406798086!2d72.83060207598818!3d19.071010352220197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c913c7bb61c7%3A0xd6cd1a684534fcd7!2sKhar%20West%2C%20Mumbai!5e0!3m2!1sen!2sin!4v1700000000001!5m2!1sen!2sin',
      directionsUrl: 'https://maps.google.com/?q=Prem+Sagar,+14th+Rd,+Khar+West,+Mumbai'
    },
    {
      city: 'Hyderabad',
      name: 'Yaperz Banjara Hills',
      address: '101, Vimbri Boulevard, Banjara Hills, Hyderabad 500034',
      phone: '+91 95991 98004',
      email: 'hyd@yaperz.com',
      hours: '11:00 AM - 9:00 PM',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.0373029103986!2d78.4403698762573!3d17.415366487900746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb973e650c8d%3A0xc3b8398ff0c31e92!2sBanjara+Hills%2C+Hyderabad!5e0!3m2!1sen!2sin!4v1700000000002!5m2!1sen!2sin',
      directionsUrl: 'https://maps.google.com/?q=Banjara+Hills,+Hyderabad'
    },
    {
      city: 'Ahmedabad',
      name: 'Yaperz Ashok Vatika',
      address: 'G10, 11ABC Lane, Ashok Vatika, Ahmedabad 380058',
      phone: '+91 92668 66286',
      email: 'ahmedabad@yaperz.com',
      hours: '11:00 AM - 9:00 PM',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.8123049103986!2d72.5403698762573!3d23.045366487900746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84c4e3650c8d%3A0xc3b8398ff0c31e92!2sAshok+Vatika%2C+Ahmedabad!5e0!3m2!1sen!2sin!4v1700000000003!5m2!1sen!2sin',
      directionsUrl: 'https://maps.google.com/?q=Ashok+Vatika,+Ahmedabad'
    },
    {
      city: 'Gurugram',
      name: 'Yaperz Ambience Island',
      address: 'F-149, Ambience Island, DLF Phase 3, Gurugram 122010',
      phone: '+91 92668 66296',
      email: 'gurugram@yaperz.com',
      hours: '11:00 AM - 9:30 PM',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.8123049103986!2d77.0803698762573!3d28.505366487900746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d19c4e3650c8d%3A0xc3b8398ff0c31e92!2sAmbience+Island%2C+Gurugram!5e0!3m2!1sen!2sin!4v1700000000004!5m2!1sen!2sin',
      directionsUrl: 'https://maps.google.com/?q=Ambience+Island,+Gurugram'
    }
  ];

  const [activeStoreIndex, setActiveStoreIndex] = useState<number>(0);

  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Walk-in Flagship Stores</h1>
      <p className={styles.subtitle}>
        Drop by any of our physical stores to experience the fabrics, fits, and brand community first-hand.
      </p>

      <div className={styles.grid}>
        {/* Left column: List of Stores */}
        <div className={styles.storesList}>
          {stores.map((store, index) => (
            <div
              key={store.city}
              onClick={() => setActiveStoreIndex(index)}
              className={`${styles.card} ${activeStoreIndex === index ? styles.cardActive : ''}`}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.storeCity}>{store.city}</h2>
                <span className={styles.statusBadge}>Open Now</span>
              </div>
              <p className={styles.address}>{store.address}</p>

              <div className={styles.infoRow}>
                <Clock size={16} className={styles.label} />
                <span className={styles.value}>{store.hours}</span>
              </div>
              <div className={styles.infoRow}>
                <Phone size={16} className={styles.label} />
                <a href={`tel:${store.phone}`} className={styles.value}>
                  {store.phone}
                </a>
              </div>
              <div className={styles.infoRow}>
                <Mail size={16} className={styles.label} />
                <a href={`mailto:${store.email}`} className={styles.value}>
                  {store.email}
                </a>
              </div>

              <div className={styles.actions}>
                <a
                  href={store.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionBtn}
                  onClick={(e) => e.stopPropagation()}
                >
                  Get Directions
                </a>
                <a href={`tel:${store.phone}`} className={styles.callBtn} onClick={(e) => e.stopPropagation()}>
                  Call Store
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Right column: Interactive Map Embed */}
        <div className={styles.mapContainer}>
          <iframe
            src={stores[activeStoreIndex].mapEmbedUrl}
            className={styles.mapIframe}
            allowFullScreen={false}
            loading="lazy"
            title={`Map locator for ${stores[activeStoreIndex].name}`}
          />
        </div>
      </div>
    </div>
  );
}
