import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const SuperAdminRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  if (!user || profile?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const EmployeeRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  if (!user || profile?.role !== 'EMPLOYEE') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
