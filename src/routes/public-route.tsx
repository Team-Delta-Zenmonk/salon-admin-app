import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  if (isAuthenticated && token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
