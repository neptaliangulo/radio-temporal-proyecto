import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <h1 style={{ fontSize: 64, color: 'var(--accent)', marginBottom: 8 }}>404</h1>
      <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Pagina no encontrada</p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-block', padding: '10px 32px' }}>
        Volver al inicio
      </Link>
    </main>
  );
}
