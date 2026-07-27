import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import ToastStack from '../components/common/ToastStack';

export default function DashboardLayout({ groups }) {
  return (
    <div className="d-flex flex-column min-vh-100 bg-cream">
      <Navbar />
      <ToastStack />
      <div className="container-fluid flex-grow-1 py-4">
        <div className="row g-4">
          <div className="col-12 col-lg-3 col-xl-2">
            <Sidebar groups={groups} />
          </div>
          <div className="col-12 col-lg-9 col-xl-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
