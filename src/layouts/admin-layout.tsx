import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Activity,
  CreditCard,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/auth.slice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStorefrontUrl } from "@/lib/domain";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const appName = import.meta.env.VITE_APP_NAME || "Veloura";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Salons Directory",
      path: "/salons",
      icon: Building2,
    },
    {
      name: "Plan Pricing",
      path: "/plans",
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased font-sans">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 overflow-hidden shadow-sm border border-border/40">
              <img
                src="/management-icon.png"
                alt="Management Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                {appName}
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                  OPS
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground">Admin Console</span>
            </div>
          </Link>

          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Platform Operations
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Portals
          </div>

          <a
            href={getStorefrontUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              Public Storefront
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="font-medium text-foreground">API Gateway</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">v5.1 Live</span>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {admin?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-foreground">
                  {admin?.name || `${appName} Admin`}
                </p>
                <p className="truncate text-[11px] text-muted-foreground font-mono">
                  {admin?.email || `admin@${appName.toLowerCase()}.com`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{appName} Cloud</span>
              <span>/</span>
              <span className="capitalize text-muted-foreground">
                {location.pathname.replace("/", "") || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="info" size="sm" withDot>
              {admin?.role?.toUpperCase() || "SUPER ADMIN"}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
