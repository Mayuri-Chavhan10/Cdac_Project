import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container py-5 text-center min-vh-content d-flex flex-column align-items-center justify-content-center">
      <i className="bi bi-signpost-split text-terracotta" style={{ fontSize: '3rem' }} />
      <h1 className="font-display mt-3">Page not found</h1>
      <p className="text-soft mb-4">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
