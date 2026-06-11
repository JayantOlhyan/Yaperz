'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring services
    console.error('NextJS Application Error:', error);
  }, [error]);

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
        500
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
        Server Error
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
        Something went wrong on our server. Try refreshing the page, or return to home.
      </p>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={reset}
          style={{
            backgroundColor: 'var(--color-text-primary)',
            color: '#fff',
            padding: '16px 32px',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'background-color 200ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-text-primary)')}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            border: '1px solid var(--color-border-dark)',
            color: 'var(--color-text-primary)',
            padding: '16px 32px',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'background-color 200ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
