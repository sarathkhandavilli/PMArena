import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute, SuperAdminRoute, EmployeeRoute } from "./components/auth/ProtectedRoute";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/auth/AuthPage";
import AdminDashboard from "./pages/admin/Dashboard";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
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

            {/* Unified Auth Route */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Employee Routes */}
            <Route element={<EmployeeRoute />}>
              <Route path="/dashboard" element={<EmployeeDashboard />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Protected Super Admin Routes */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
            </Route>

            {/* Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
