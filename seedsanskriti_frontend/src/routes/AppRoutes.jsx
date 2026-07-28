import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import SupplierLayout from '../layouts/SupplierLayout';
import AdminLayout from '../layouts/AdminLayout';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleRoute from '../components/auth/RoleRoute';
import GuestRoute from '../components/auth/GuestRoute';

import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Products from '../pages/public/Products';
import ProductDetails from '../pages/public/ProductDetails';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import NotFound from '../pages/public/NotFound';
import Unauthorized from '../pages/public/Unauthorized';

import CustomerDashboard from '../pages/customer/Dashboard';
import Profile from '../pages/customer/Profile';
import EditProfile from '../pages/customer/EditProfile';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import Orders from '../pages/customer/Orders';
import OrderDetails from '../pages/customer/OrderDetails';
import PaymentHistory from '../pages/customer/PaymentHistory';
import Wishlist from '../pages/customer/Wishlist';

import SupplierDashboard from '../pages/supplier/Dashboard';
import MyProducts from '../pages/supplier/MyProducts';
import AddProduct from '../pages/supplier/AddProduct';
import EditProduct from '../pages/supplier/EditProduct';
import OrdersReceived from '../pages/supplier/OrdersReceived';
import DeliveryStatus from '../pages/supplier/DeliveryStatus';

import AdminDashboard from '../pages/admin/Dashboard';
import CustomerManagement from '../pages/admin/CustomerManagement';
import SupplierManagement from '../pages/admin/SupplierManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import DeliveryManagement from '../pages/admin/DeliveryManagement';
import Reports from '../pages/admin/Reports';

import { ROLES } from '../utils/constants';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Customer area */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          {/* Outside CustomerLayout: full-width auth-style page, reused from Register */}
          <Route path="/register/supplier-upgrade" element={<Register upgrade />} />
          <Route element={<CustomerLayout />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/profile" element={<Profile />} />
            <Route path="/customer/profile/edit" element={<EditProfile />} />
            <Route path="/customer/cart" element={<Cart />} />
            <Route path="/customer/checkout" element={<Checkout />} />
            <Route path="/customer/orders" element={<Orders />} />
            <Route path="/customer/orders/:id" element={<OrderDetails />} />
            <Route path="/customer/payments" element={<PaymentHistory />} />
            <Route path="/customer/wishlist" element={<Wishlist />} />
          </Route>
        </Route>

        {/* Supplier area */}
        <Route element={<RoleRoute allowedRoles={[ROLES.SUPPLIER]} />}>
          <Route element={<SupplierLayout />}>
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/products" element={<MyProducts />} />
            <Route path="/supplier/products/new" element={<AddProduct />} />
            <Route path="/supplier/products/:id/edit" element={<EditProduct />} />
            <Route path="/supplier/orders" element={<OrdersReceived />} />
            <Route path="/supplier/deliveries" element={<DeliveryStatus />} />
          </Route>
        </Route>

        {/* Admin area */}
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/suppliers" element={<SupplierManagement />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/orders" element={<OrderManagement />} />
            <Route path="/admin/payments" element={<PaymentManagement />} />
            <Route path="/admin/deliveries" element={<DeliveryManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
