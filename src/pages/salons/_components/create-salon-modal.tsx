import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Lock, Globe, AlertCircle, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import { createSalonAction } from "@/features/salons/create-salon/create-salon.action";
import { listSalonsAction } from "@/features/salons/list-salons/list-salons.action";
import { getStorefrontDomain } from "@/lib/domain";
import { SUBSCRIPTION_PLAN } from "@/common/enums/subscription.enum";
import { createSalonSchema, type CreateSalonForm } from "./schema/create-salon.schema";

interface CreateSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSalonModal: React.FC<CreateSalonModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [slugModified, setSlugModified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateSalonForm>({
    resolver: zodResolver(createSalonSchema),
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      phone: "",
      password: "",
      trial_days: 15,
      plan: SUBSCRIPTION_PLAN.TRIAL,
    },
  });

  const watchSlug = watch("slug");

  const handleClose = () => {
    reset();
    setSlugModified(false);
    setError(null);
    onClose();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val, { shouldValidate: true });
    if (!slugModified) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generated, { shouldValidate: true });
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("password", `${pass}!`, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateSalonForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await dispatch(
        createSalonAction({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || undefined,
          password: data.password,
          slug: data.slug?.trim() || undefined,
          trial_days: Number(data.trial_days),
          subscription_plan: data.plan,
        })
      ).unwrap();

      dispatch(listSalonsAction());
      handleClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to provision salon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Provision New Salon Tenant"
      description="Register a new salon business and provision their SaaS workspace and storefront."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Salon Business Name *"
            placeholder="e.g. Aura Hair Studio"
            {...register("name", { onChange: handleNameChange })}
            leftIcon={<Building2 className="h-4 w-4" />}
            error={errors.name?.message}
          />

          <div>
            <Input
              label="Storefront Subdomain Slug"
              placeholder="aura-hair-studio"
              {...register("slug", {
                onChange: (e) => {
                  setSlugModified(true);
                  setValue(
                    "slug",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    { shouldValidate: true }
                  );
                },
              })}
              leftIcon={<Globe className="h-4 w-4" />}
              helperText={watchSlug ? `Preview: ${watchSlug}.${getStorefrontDomain()}` : "Auto-generated from name"}
              error={errors.slug?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Owner Email Address *"
            type="email"
            placeholder="owner@aurastudio.com"
            {...register("email")}
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 019-2834"
            {...register("phone")}
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
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
            {...register("password")}
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold tracking-wide text-foreground mb-1.5">
              Initial Plan Tier
            </label>
            <select
              {...register("plan")}
              className="w-full h-10 rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value={SUBSCRIPTION_PLAN.TRIAL}>Free Trial (15 Days)</option>
              <option value={SUBSCRIPTION_PLAN.MONTHLY}>Monthly Plan (₹2,499/mo)</option>
              <option value={SUBSCRIPTION_PLAN.YEARLY}>Yearly Plan (₹24,990/yr)</option>
            </select>
            {errors.plan?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.plan.message}</p>
            )}
          </div>

          <Input
            label="Trial Period (Days)"
            type="number"
            min="1"
            max="90"
            {...register("trial_days")}
            error={errors.trial_days?.message}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
