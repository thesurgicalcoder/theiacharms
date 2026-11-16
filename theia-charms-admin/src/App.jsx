import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AdminLayout from './components/AdminLayout';
import { ErrorBox } from './components/ui';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import BannersPage from './pages/BannersPage';
import UsersPage from './pages/UsersPage';
import LogsPage from './pages/LogsPage';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';
import ImportPage from './pages/ImportPage';

// Hides pages the role cannot use (the API enforces the same rules server-side).
function Guard({ perm, children }) {
  const { can } = useAuth();
  return can(perm) ? children : <ErrorBox error="You do not have permission to view this page." />;
}

export default function App() {
  return (
    <AuthProvider><ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<LoginPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="import" element={<Guard perm="import"><ImportPage /></Guard>} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="users" element={<Guard perm="users"><UsersPage /></Guard>} />
            <Route path="logs" element={<Guard perm="logs"><LogsPage /></Guard>} />
            <Route path="export" element={<Guard perm="export"><ExportPage /></Guard>} />
            <Route path="settings" element={<Guard perm="settings"><SettingsPage /></Guard>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider></AuthProvider>
  );
}
