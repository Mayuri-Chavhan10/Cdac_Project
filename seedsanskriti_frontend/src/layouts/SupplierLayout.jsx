import DashboardLayout from './DashboardLayout';

const groups = [
  {
    heading: 'Overview',
    items: [{ to: '/supplier/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', end: true }],
  },
  {
    heading: 'Catalog',
    items: [
      { to: '/supplier/products', label: 'My Products', icon: 'bi-seedling' },
      { to: '/supplier/products/new', label: 'Add Product', icon: 'bi-plus-circle' },
    ],
  },
  {
    heading: 'Fulfilment',
    items: [
      { to: '/supplier/orders', label: 'Orders Received', icon: 'bi-bag-check' },
      { to: '/supplier/deliveries', label: 'Delivery Status', icon: 'bi-truck' },
    ],
  },
];

export default function SupplierLayout() {
  return <DashboardLayout groups={groups} />;
}
