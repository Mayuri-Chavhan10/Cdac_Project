// Mirrors backend enums exactly (com.seedsanskriti.enums.*)

export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SUPPLIER: 'SUPPLIER',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
};

export const SUPPLIER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS);

export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const DELIVERY_STATUS_OPTIONS = Object.values(DELIVERY_STATUS);

export const PAYMENT_METHOD = {
  UPI: 'UPI',
  CARD: 'CARD',
  NET_BANKING: 'NET_BANKING',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
};

export const PAYMENT_METHOD_LABELS = {
  UPI: 'UPI',
  CARD: 'Credit / Debit Card',
  NET_BANKING: 'Net Banking',
  CASH_ON_DELIVERY: 'Cash on Delivery',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const CATEGORY = {
  VEGETABLE_SEEDS: 'VEGETABLE_SEEDS',
  FRUIT_SEEDS: 'FRUIT_SEEDS',
  FLOWER_SEEDS: 'FLOWER_SEEDS',
  GRAIN_SEEDS: 'GRAIN_SEEDS',
  BUDS: 'BUDS',
  SAPLINGS: 'SAPLINGS',
};

export const CATEGORY_LABELS = {
  VEGETABLE_SEEDS: 'Vegetable Seeds',
  FRUIT_SEEDS: 'Fruit Seeds',
  FLOWER_SEEDS: 'Flower Seeds',
  GRAIN_SEEDS: 'Grain Seeds',
  BUDS: 'Buds',
  SAPLINGS: 'Saplings',
};

export const CATEGORY_OPTIONS = Object.values(CATEGORY);

// Badge color helpers -------------------------------------------------

export const orderStatusVariant = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'SHIPPED':
      return 'info';
    case 'CONFIRMED':
    case 'ACCEPTED':
      return 'primary';
    case 'PLACED':
    case 'PENDING':
    default:
      return 'warning';
  }
};

export const deliveryStatusVariant = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'OUT_FOR_DELIVERY':
    case 'SHIPPED':
      return 'info';
    case 'PACKED':
      return 'primary';
    case 'PENDING':
    default:
      return 'warning';
  }
};

export const paymentStatusVariant = (status) => {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'danger';
    case 'REFUNDED':
      return 'info';
    case 'PENDING':
    default:
      return 'warning';
  }
};

export const userStatusVariant = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'BLOCKED':
      return 'danger';
    case 'INACTIVE':
    default:
      return 'secondary';
  }
};

export const supplierStatusVariant = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'PENDING':
    default:
      return 'warning';
  }
};

export const TOKEN_KEY = 'seedsanskriti_token';
export const USER_KEY = 'seedsanskriti_user';
