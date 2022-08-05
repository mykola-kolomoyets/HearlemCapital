import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '../../views/components/UI/Spinner';

const InvestorOverview = lazy(() => import('../../views/dashboard/Overview/InvestorOverview'));
const Products = lazy(() => import('../../views/dashboard/Products'));
const Transactions = lazy(() => import('../../views/dashboard/Transactions'));
const Portfolio = lazy(() => import('../../views/dashboard/Portfolio'));
const InvestorView = lazy(() => import('../../views/dashboard/Investors/InvestorView'));

const InvestorPages = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path='/overview' element={<InvestorOverview />}/>
      <Route path='/products' element={<Products />}/>
      <Route path='/portfolio' element={<Portfolio />}/>
      <Route path='/transactions' element={<Transactions />}/>
      <Route path='/:id' element={<InvestorView />}/>
    </Routes>
  </Suspense>
);

export default InvestorPages;