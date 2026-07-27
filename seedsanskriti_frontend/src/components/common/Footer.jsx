import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <h5 className="text-white d-flex align-items-center gap-2">
              <i className="bi bi-flower2" /> SeedSanskriti
            </h5>
            <p className="small mb-0" style={{ opacity: 0.8 }}>
              A marketplace connecting growers with trusted seed, sapling and bud suppliers —
              rooted in tradition, grown for tomorrow.
            </p>
          </div>
          <div className="col-6 col-md-2">
            <h6 className="text-white">Shop</h6>
            <ul className="list-unstyled small">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=VEGETABLE_SEEDS">Vegetable Seeds</Link></li>
              <li><Link to="/products?category=FLOWER_SEEDS">Flower Seeds</Link></li>
              <li><Link to="/products?category=SAPLINGS">Saplings</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-2">
            <h6 className="text-white">Company</h6>
            <ul className="list-unstyled small">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/register">Become a Supplier</Link></li>
            </ul>
          </div>
          <div className="col-12 col-md-4">
            <h6 className="text-white">Stay in touch</h6>
            <p className="small mb-2" style={{ opacity: 0.8 }}>Questions about an order or your account?</p>
            <a href="mailto:support@seedsanskriti.example" className="small d-block">
              <i className="bi bi-envelope me-2" />support@seedsanskriti.example
            </a>
          </div>
        </div>
        <hr className="border-secondary my-4" style={{ opacity: 0.2 }} />
        <div className="d-flex flex-column flex-md-row justify-content-between small" style={{ opacity: 0.75 }}>
          <span>© {new Date().getFullYear()} SeedSanskriti. All rights reserved.</span>
          <span>Made for growers, by growers.</span>
        </div>
      </div>
    </footer>
  );
}
