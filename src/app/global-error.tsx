'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#142052',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: '32rem', width: '100%', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '6rem',
                  height: '6rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  marginBottom: '1.5rem',
                }}
              >
                <AlertTriangle
                  style={{ width: '3rem', height: '3rem', color: '#f87171' }}
                />
              </div>
              <h1
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '0.5rem',
                }}
              >
                Critical Error
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                A critical error has occurred. Please try refreshing the page.
              </p>
              {error.digest && (
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    display: 'inline-block',
                  }}
                >
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <button
              onClick={reset}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fef483',
                color: '#142052',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Refresh Page
            </button>

            <div style={{ marginTop: '3rem', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem' }}>
              <p>We4U - Service Operations Platform</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
