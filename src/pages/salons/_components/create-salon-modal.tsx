import React, { useState } from "react";
import { Building2, Mail, Phone, Lock, Globe, AlertCircle, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import { createSalonAction } from "@/features/salons/create-salon/create-salon.action";
import { listSalonsAction } from "@/features/salons/list-salons/list-salons.action";
import { getStorefrontDomain } from "@/lib/domain";
import { SUBSCRIPTION_PLAN, type SubscriptionPlan } from "@/common/enums/subscription.enum";

interface CreateSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSalonModal: React.FC<CreateSalonModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugModified, setSlugModified] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("Password@123");
  const [trialDays, setTrialDays] = useState(15);
  const [plan, setPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLAN.TRIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugModified) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(`${pass}!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Salon Name, Email, and Password are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await dispatch(
        createSalonAction({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
          slug: slug.trim() || undefined,
          trial_days: Number(trialDays),
          subscription_plan: plan,
        })
      ).unwrap();

      dispatch(listSalonsAction());

      setName("");
      setSlug("");
      setSlugModified(false);
      setEmail("");
      setPhone("");
      setPassword("Password@123");
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to provision salon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision New Salon Tenant"
      description="Register a new salon business and provision their SaaS workspace and storefront."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Salon Business Name *"
            placeholder="e.g. Aura Hair Studio"
            value={name}
            onChange={handleNameChange}
            leftIcon={<Building2 className="h-4 w-4" />}
            required
          />

          <div>
            <Input
              label="Storefront Subdomain Slug"
              placeholder="aura-hair-studio"
              value={slug}
              onChange={(e) => {
                setSlugModified(true);
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                );
              }}
              leftIcon={<Globe className="h-4 w-4" />}
              helperText={slug ? `Preview: ${slug}.${getStorefrontDomain()}` : "Auto-generated from name"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Owner Email Address *"
            type="email"
            placeholder="owner@aurastudio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 019-2834"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wide text-foreground">
              Initial Password *
            </label>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RefreshCw className="h-3 w-3" />
              Generate Secure
            </button>
          </div>
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold tracking-wide text-foreground mb-1.5">
              Initial Plan Tier
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
              className="w-full h-10 rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value={SUBSCRIPTION_PLAN.TRIAL}>Free Trial (15 Days)</option>
              <option value={SUBSCRIPTION_PLAN.MONTHLY}>Monthly Plan (₹2,499/mo)</option>
              <option value={SUBSCRIPTION_PLAN.YEARLY}>Yearly Plan (₹24,990/yr)</option>
            </select>
          </div>

          <Input
            label="Trial Period (Days)"
            type="number"
            min="1"
            max="90"
            value={trialDays}
            onChange={(e) => setTrialDays(parseInt(e.target.value) || 15)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Provision Salon
          </Button>
        </div>
      </form>
    </Modal>
  );
};
