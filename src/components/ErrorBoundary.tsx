import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Activity, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1.5rem', 
          color: 'var(--accent-teal)', 
          textAlign: 'center', 
          padding: '2rem',
          background: '#0f1115'
        }}>
          <Activity size={48} color="var(--accent-amber)" className="animate-pulse" />
          <div>
            <h2 style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Interface Disruption Detected
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', lineHeight: 1.6 }}>
              A critical error occurred in the dashboard UI. Your data remains secure on the network, but the interface needs a reset.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary" 
              style={{ 
                marginTop: '2rem', 
                background: 'var(--accent-teal)', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '2rem auto 0'
              }}
            >
              <RotateCcw size={18} /> Reconnect Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
