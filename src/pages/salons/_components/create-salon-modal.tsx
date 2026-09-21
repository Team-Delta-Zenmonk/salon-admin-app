import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Lock, Globe, AlertCircle, RefreshCw, CheckCircle2, Sparkles, Calendar, Zap } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createSalonAction } from "@/features/salons/create-salon/create-salon.action";
import { listSalonsAction } from "@/features/salons/list-salons/list-salons.action";
import { fetchSubscriptionPlans } from "@/features/plans/plans.slice";
import { getStorefrontDomain } from "@/lib/domain";
import { SUBSCRIPTION_PLAN } from "@/common/enums/subscription.enum";
import { createSalonSchema, type CreateSalonForm } from "./schema/create-salon.schema";

interface CreateSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSalonModal: React.FC<CreateSalonModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { plans: backendPlans } = useAppSelector((state) => state.plans);
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
  const watchPlan = watch("plan");

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSubscriptionPlans());
    }
  }, [isOpen, dispatch]);

  const iconMap: Record<string, React.ReactNode> = {
    trial: <Sparkles className="h-4 w-4 text-amber-500" />,
    monthly: <Calendar className="h-4 w-4 text-blue-500" />,
    yearly: <Zap className="h-4 w-4 text-emerald-500" />,
  };

  const planOptions = backendPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.formatted_price === "Free" ? "Free" : `${p.formatted_price} ${p.billing_cycle}`,
    description: p.description,
    badge: p.badge,
    icon: iconMap[p.id] || <Zap className="h-4 w-4 text-primary" />,
  }));

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
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-salon-form"
            isLoading={isSubmitting}
            className="w-full sm:w-auto"
          >
            Provision Salon
          </Button>
        </>
      }
    >
      <form id="create-salon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold tracking-wide text-foreground">
            Initial Plan Tier *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {planOptions.map((plan) => {
              const isSelected = watchPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setValue("plan", plan.id, { shouldValidate: true })}
                  className={`cursor-pointer rounded-xl border p-3 transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                      : "border-border bg-card hover:border-foreground/30 hover:bg-muted/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        {plan.icon}
                        <span className="text-xs font-bold text-foreground">{plan.name}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-primary">{plan.price}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-snug">
                      {plan.description}
                    </p>
                  </div>

                  {plan.badge && (
                    <div className="mt-2.5">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-md ${
                        isSelected
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {errors.plan?.message && (
            <p className="mt-1 text-xs text-destructive">{errors.plan.message}</p>
          )}
        </div>

        <div className="pt-1">
          <Input
            label="Initial Trial Period (Days) *"
            type="number"
            min="1"
            max="90"
            {...register("trial_days")}
            helperText="Trial period granted regardless of selected plan tier."
            error={errors.trial_days?.message}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 transition-opacity">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </Modal>
  );
};
