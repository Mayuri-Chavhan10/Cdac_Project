import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="container py-5 text-center min-vh-content d-flex flex-column align-items-center justify-content-center">
      <i className="bi bi-shield-lock text-terracotta" style={{ fontSize: '3rem' }} />
      <h1 className="font-display mt-3">Access denied</h1>
      <p className="text-soft mb-4">You don't have permission to view this page with your current account.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
