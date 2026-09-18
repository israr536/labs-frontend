import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  private redirectTimer?: number;

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PathMLT interface error:', error, info.componentStack);
    this.redirectTimer = window.setTimeout(() => window.location.replace('/'), 1400);
  }

  componentWillUnmount() {
    if (this.redirectTimer) window.clearTimeout(this.redirectTimer);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f7fafc', color: '#172033', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <section role="alert" style={{ width: 'min(100%, 520px)', padding: 32, border: '1px solid #dbe5ee', borderRadius: 20, background: '#fff', boxShadow: '0 18px 50px rgba(15, 23, 42, .08)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, margin: '0 auto 16px', display: 'grid', placeItems: 'center', borderRadius: 14, background: '#e8f5f2', color: '#087f72', fontSize: 22, fontWeight: 800 }}>P</div>
          <p style={{ margin: '0 0 8px', color: '#087f72', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>PathMLT workspace</p>
          <h1 style={{ margin: '0 0 10px', fontSize: 24, lineHeight: 1.25 }}>We’re taking you somewhere safe</h1>
          <p style={{ margin: '0 0 22px', color: '#64748b', lineHeight: 1.6 }}>This page could not load correctly. We’ll return you to the PathMLT home page so you can continue without a broken screen.</p>
          <button type="button" onClick={() => window.location.replace('/')} style={{ minHeight: 42, padding: '0 18px', border: 0, borderRadius: 10, background: '#087f72', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Return to home</button>
        </section>
      </main>
    );
  }
}
