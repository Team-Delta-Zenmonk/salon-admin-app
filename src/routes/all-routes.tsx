import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { AdminLayout } from "@/layouts/admin-layout";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { SalonsPage } from "@/pages/salons";
import { PlansPage } from "@/pages/plans";

const AdminLayoutWrapper: React.FC = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayoutWrapper />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/salons" element={<SalonsPage />} />
            <Route path="/plans" element={<PlansPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
