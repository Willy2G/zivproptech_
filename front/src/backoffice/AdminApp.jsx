import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

import Dashboard from './views/Dashboard.jsx';
import Crm from './views/Crm.jsx';
import Logiciels from './views/Logiciels.jsx';
import Blog from './views/Blog.jsx';
import Testimonials from './views/Testimonials.jsx';
import Faq from './views/Faq.jsx';
import Seo from './views/Seo.jsx';
import Login from './views/Login.jsx';

/**
 * Composant pour protéger les routes admin
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

/**
 * Back office monte sous /admin. Routes relatives (le prefixe /admin vient de
 * la route parente definie dans App.jsx). Le ToastProvider n'englobe que l'admin.
 */
export default function AdminApp() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        
        <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="crm" element={<Crm />} />
          <Route path="logiciels" element={<Logiciels />} />
          <Route path="blog" element={<Blog />} />
          <Route path="temoignages" element={<Testimonials />} />
          <Route path="faq" element={<Faq />} />
          <Route path="seo" element={<Seo />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
