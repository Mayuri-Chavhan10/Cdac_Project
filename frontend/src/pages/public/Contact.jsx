import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-lg-5">
          <span className="section-eyebrow">Get in touch</span>
          <h1 className="font-display mb-3">We'd love to hear from you</h1>
          <p className="text-soft mb-4">
            Questions about an order, a supplier application, or the platform itself — reach out
            and our team will get back to you.
          </p>
          <ul className="list-unstyled d-flex flex-column gap-3">
            <li className="d-flex gap-3">
              <i className="bi bi-envelope text-terracotta fs-5" />
              <div>
                <div className="fw-semibold">Email</div>
                <div className="text-soft">support@seedsanskriti.example</div>
              </div>
            </li>
            <li className="d-flex gap-3">
              <i className="bi bi-telephone text-terracotta fs-5" />
              <div>
                <div className="fw-semibold">Phone</div>
                <div className="text-soft">+91 98765 43210</div>
              </div>
            </li>
            <li className="d-flex gap-3">
              <i className="bi bi-geo-alt text-terracotta fs-5" />
              <div>
                <div className="fw-semibold">Office</div>
                <div className="text-soft">Pune, Maharashtra, India</div>
              </div>
            </li>
          </ul>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            {submitted && (
              <div className="alert alert-success">
                Thanks for reaching out! We'll get back to you within 1–2 business days.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="5" name="message" value={form.message} onChange={handleChange} required />
              </div>
              <button className="btn btn-primary" type="submit">
                <i className="bi bi-send me-2" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
