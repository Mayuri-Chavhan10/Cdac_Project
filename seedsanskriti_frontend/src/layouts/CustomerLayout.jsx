import DashboardLayout from './DashboardLayout';

const groups = [
  {
    heading: 'My Account',
    items: [
      { to: '/customer/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
      { to: '/customer/profile', label: 'Profile', icon: 'bi-person' },
    ],
  },
  {
    heading: 'Shopping',
    items: [
      { to: '/customer/cart', label: 'Cart', icon: 'bi-cart3' },
      { to: '/customer/wishlist', label: 'Wishlist', icon: 'bi-heart' },
      { to: '/customer/orders', label: 'Orders', icon: 'bi-bag-check' },
    ],
  },
  {
    heading: 'Payments',
    items: [
      { to: '/customer/payments', label: 'Payment History', icon: 'bi-credit-card' },
    ],
  },
];

export default function CustomerLayout() {
  return <DashboardLayout groups={groups} />;
}
