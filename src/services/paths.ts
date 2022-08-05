export const products = '/products';
export const holdings = '/holdings';
export const transactions = '/transactions';
export const notifications = '/notifications';
export const compliance = '/compliance';

export const users = {
  get: '/users',
  create: '/users',
  update: '/users',
  delete: '/users',
  createByAdmin: '/users/createByAdmin',
  requestDeactivate: '/users/request-deactivate',
  deactivate: '/users/deactivate'
};

export const investor = {
  overview: '/users/investor/overview',
  list: '/users/investors',
  complex: '/users/investor/complex',
  portfolio: '/users/investor/portfolio'
};

export const issuer = {
  overview: '/users/issuer/overview',
  complex: '/users/issuer/complex',
  list: '/users/issuers'
};

export const admin = {
  overview: '/users/overview',
  assignRole: '/users/assign'
};