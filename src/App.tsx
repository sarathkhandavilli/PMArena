import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute, SuperAdminRoute, EmployeeRoute } from "./components/auth/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/auth/AuthPage";

// Admin pages
import AdminHome from "./pages/admin/Dashboard";
import ProblemsPage from "./pages/admin/Problems";
import ImportsPage from "./pages/admin/Imports";

// Super Admin pages
import SuperAdminHome from "./pages/superadmin/Dashboard";
import TenantsPage from "./pages/superadmin/Tenants";
import AdminsPage from "./pages/superadmin/Admins";

// Employee
import EmployeeDashboard from "./pages/employee/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Employee */}
            <Route element={<EmployeeRoute />}>
              <Route path="/dashboard" element={<EmployeeDashboard />} />
            </Route>

            {/* Admin – wrapped in AppShell */}
            <Route element={<AdminRoute />}>
              <Route element={<AppShell />}>
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/problems" element={<ProblemsPage />} />
                <Route path="/admin/imports" element={<ImportsPage />} />
              </Route>
            </Route>

            {/* Super Admin – wrapped in AppShell */}
            <Route element={<SuperAdminRoute />}>
              <Route element={<AppShell />}>
                <Route path="/super-admin" element={<SuperAdminHome />} />
                <Route path="/super-admin/tenants" element={<TenantsPage />} />
                <Route path="/super-admin/admins" element={<AdminsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
