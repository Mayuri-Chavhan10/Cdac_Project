export default function About() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <span className="section-eyebrow">Our Story</span>
          <h1 className="font-display mb-4">Rooted in tradition, growing forward</h1>
          <p className="lead text-soft">
            SeedSanskriti began as a simple idea: make it easy for gardeners and farmers to find
            seeds, saplings and buds directly from the people who grow and source them.
          </p>
          <hr className="sow-line" />
          <div className="row g-4 mt-2">
            <div className="col-md-6">
              <h5><i className="bi bi-bullseye text-terracotta me-2" />Our Mission</h5>
              <p className="text-soft">
                To build a transparent marketplace where every supplier is verified, every product
                is honestly described, and every customer can track their order from seed to soil.
              </p>
            </div>
            <div className="col-md-6">
              <h5><i className="bi bi-eye text-terracotta me-2" />Our Vision</h5>
              <p className="text-soft">
                A future where local growers and home gardeners have the same access to quality
                planting material as large commercial farms.
              </p>
            </div>
            <div className="col-md-6">
              <h5><i className="bi bi-shield-check text-terracotta me-2" />Verified Suppliers</h5>
              <p className="text-soft">
                Every supplier that joins SeedSanskriti is reviewed by our admin team before their
                products go live, so you always know who you're buying from.
              </p>
            </div>
            <div className="col-md-6">
              <h5><i className="bi bi-people text-terracotta me-2" />Community First</h5>
              <p className="text-soft">
                Ratings and reviews come from real customers, helping the whole community make
                better planting decisions season after season.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
