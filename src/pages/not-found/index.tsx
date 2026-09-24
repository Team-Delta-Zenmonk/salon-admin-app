import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Home, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 antialiased font-sans">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Logo / Admin Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-border/40 shadow-xs">
            <img src="/management-icon.png" alt="Admin Logo" className="h-full w-full object-cover rounded-xl" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Veloura <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary border border-primary/20">OPS</span>
          </span>
        </div>

        {/* Card Box */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm relative overflow-hidden">
          {/* Subtle decorative background accent */}
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6 shadow-xs">
            <ShieldAlert className="h-10 w-10" />
          </div>

          {/* 404 Display */}
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold font-mono text-primary border border-primary/20 mb-3">
            ERROR 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Admin View Not Found
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            The page or administrative endpoint you are looking for does not exist, has been moved, or requires elevated privileges.
          </p>

          <div className="rounded-xl bg-muted/60 border border-border p-4 mb-6 text-left text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground">Possible reasons:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The URL route was typed incorrectly</li>
              <li>The resource was removed from Veloura OPS</li>
              <li>Your current administrative session may have expired</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full sm:w-auto gap-2 text-xs font-medium cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full gap-2 text-xs font-semibold cursor-pointer">
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-muted-foreground">
          Need assistance? Contact <span className="text-foreground font-medium">Veloura Systems Admin</span>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
