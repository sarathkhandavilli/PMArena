import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullPageSkeleton } from '@/components/ui/PageLoading';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSkeleton />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullPageSkeleton />;

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const SuperAdminRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullPageSkeleton />;

  if (!user || profile?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const EmployeeRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullPageSkeleton />;

  if (!user || profile?.role !== 'EMPLOYEE') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
