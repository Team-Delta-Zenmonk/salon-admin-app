import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import { AdminLayout } from "@/layouts/admin-layout";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { SalonsPage } from "@/pages/salons";
import { CreateSalonModal } from "@/pages/salons/_components/create-salon-modal";

const AdminLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <AdminLayout onOpenCreateSalon={() => setCreateModalOpen(true)}>
      {children}
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
          <Route
            path="/dashboard"
            element={
              <AdminLayoutWrapper>
                <DashboardPage />
              </AdminLayoutWrapper>
            }
          />
          <Route
            path="/salons"
            element={
              <AdminLayoutWrapper>
                <SalonsPage />
              </AdminLayoutWrapper>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
