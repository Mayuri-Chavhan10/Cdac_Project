import DashboardLayout from './DashboardLayout';

const groups = [
  {
    heading: 'Overview',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', end: true }],
  },
  {
    heading: 'Management',
    items: [
      { to: '/admin/customers', label: 'Customer Management', icon: 'bi-people' },
      { to: '/admin/suppliers', label: 'Supplier Management', icon: 'bi-shop' },
      { to: '/admin/products', label: 'Product Management', icon: 'bi-seedling' },
      { to: '/admin/categories', label: 'Category Management', icon: 'bi-tags' },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { to: '/admin/orders', label: 'Order Management', icon: 'bi-bag-check' },
      { to: '/admin/payments', label: 'Payment Management', icon: 'bi-credit-card' },
      { to: '/admin/deliveries', label: 'Delivery Management', icon: 'bi-truck' },
      { to: '/admin/reports', label: 'Reports', icon: 'bi-graph-up' },
    ],
  },
];

export default function AdminLayout() {
  return <DashboardLayout groups={groups} />;
}
