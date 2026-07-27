import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from '../../utils/constants';

const categoryIcon = {
  VEGETABLE_SEEDS: 'bi-basket',
  FRUIT_SEEDS: 'bi-apple',
  FLOWER_SEEDS: 'bi-flower1',
  GRAIN_SEEDS: 'bi-flower3',
  BUDS: 'bi-flower2',
  SAPLINGS: 'bi-tree',
};

export default function CategoryManagement() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService
      .getAllProducts()
      .then((products) => {
        const tally = {};
        products.forEach((p) => {
          tally[p.category] = (tally[p.category] || 0) + 1;
        });
        setCounts(tally);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading categories…" />;

  return (
    <div>
      <h2 className="font-display mb-1">Category Management</h2>
      <p className="text-soft mb-4">
        SeedSanskriti uses a fixed set of categories defined by the platform. Here's how many
        active listings fall under each one.
      </p>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <div className="row g-3">
        {CATEGORY_OPTIONS.map((cat) => (
          <div className="col-md-6 col-lg-4" key={cat}>
            <div className="card border-0 shadow-sm p-4 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-green-100 text-primary">
                  <i className={`bi ${categoryIcon[cat]}`} />
                </div>
                <div>
                  <h6 className="mb-0">{CATEGORY_LABELS[cat]}</h6>
                  <span className="text-soft small">{counts[cat] || 0} product{(counts[cat] || 0) === 1 ? '' : 's'} listed</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
