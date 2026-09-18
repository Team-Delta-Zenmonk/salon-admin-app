import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { AdminLayout } from "@/layouts/admin-layout";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { SalonsPage } from "@/pages/salons";
import { CreateSalonModal } from "@/pages/salons/_components/create-salon-modal";

const AdminLayoutWrapper: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <AdminLayout onOpenCreateSalon={() => setCreateModalOpen(true)}>
      <Outlet />
      <CreateSalonModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
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
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
