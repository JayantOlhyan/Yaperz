'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        textAlign: 'center',
        padding: '0 20px',
        backgroundColor: '#fff'
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '120px',
          fontWeight: 900,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.05em',
          lineHeight: 1.0,
          margin: 0
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '20px 0 12px 0',
          color: 'var(--color-accent)'
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--color-text-muted)',
          maxWidth: '450px',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}
      >
        The drop or page you are looking for has been archived, moved, or never existed in our catalog.
      </p>
      <Link
        href="/collections/all-products"
        style={{
          backgroundColor: 'var(--color-text-primary)',
          color: '#fff',
          padding: '16px 40px',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          transition: 'background-color 200ms ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-text-primary)')}
      >
        Back to Shop
      </Link>
    </div>
  );
}
