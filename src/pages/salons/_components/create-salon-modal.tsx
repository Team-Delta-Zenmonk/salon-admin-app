import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Mail,
  Phone,
  Lock,
  Globe,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Calendar,
  Zap,
  Tag,
  Percent,
  IndianRupee,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createSalonAction } from "@/features/salons/create-salon/create-salon.action";
import { listSalonsAction } from "@/features/salons/list-salons/list-salons.action";
import { fetchSubscriptionPlans } from "@/features/plans/plans.slice";
import { getStorefrontDomain } from "@/lib/domain";
import {
  SUBSCRIPTION_PLAN,
  DISCOUNT_TYPE,
  PLAN_BASE_PRICES,
} from "@/common/enums/subscription.enum";
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
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateSalonForm>({
    resolver: zodResolver(createSalonSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      phone: "",
      password: "",
      trial_days: 15,
      plan: SUBSCRIPTION_PLAN.TRIAL,
      discount_type: DISCOUNT_TYPE.MANUAL,
      discount_value: undefined,
    },
  });

  const watchSlug = watch("slug");
  const watchPlan = watch("plan");
  const watchDiscountType = watch("discount_type");
  const watchDiscountValue = watch("discount_value");

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

  const isPaidPlan = watchPlan !== SUBSCRIPTION_PLAN.TRIAL;

  const currentBasePrice =
    backendPlans.find((p) => p.id === watchPlan)?.amount ||
    (isPaidPlan ? PLAN_BASE_PRICES[watchPlan] : 0) ||
    0;

  const numericDiscountValue =
    watchDiscountValue !== undefined && !isNaN(Number(watchDiscountValue))
      ? Number(watchDiscountValue)
      : 0;

  let discountDeduction = 0;
  if (isPaidPlan && numericDiscountValue > 0) {
    if (watchDiscountType === DISCOUNT_TYPE.PERCENTAGE) {
      discountDeduction = Math.min(
        Math.round((currentBasePrice * numericDiscountValue) / 100),
        currentBasePrice
      );
    } else {
      discountDeduction = Math.min(numericDiscountValue, currentBasePrice);
    }
  }
  const netPayable = Math.max(0, currentBasePrice - discountDeduction);

  const handleClose = () => {
    reset({
      name: "",
      slug: "",
      email: "",
      phone: "",
      password: "",
      trial_days: 15,
      plan: SUBSCRIPTION_PLAN.TRIAL,
      discount_type: DISCOUNT_TYPE.MANUAL,
      discount_value: undefined,
    });
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

      const isPaid = data.plan !== SUBSCRIPTION_PLAN.TRIAL;
      const baseAmount = isPaid ? currentBasePrice : undefined;
      const hasValidDiscount =
        isPaid && data.discount_value !== undefined && Number(data.discount_value) > 0;

      const discountDetails = hasValidDiscount
        ? {
            type: data.discount_type,
            value: Number(data.discount_value),
          }
        : null;

      await dispatch(
        createSalonAction({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || undefined,
          password: data.password,
          slug: data.slug?.trim() || undefined,
          trial_days: Number(data.trial_days),
          subscription_plan: data.plan,
          amount: baseAmount,
          discount_details: discountDetails,
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
      <form id="create-salon-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
                  onClick={() => {
                    setValue("plan", plan.id, { shouldValidate: true });
                    trigger("discount_value");
                  }}
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
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-md ${
                          isSelected
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
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

        <div className="rounded-xl border border-border bg-card p-4 space-y-3.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <span className="text-xs font-bold text-foreground">
                  Subscription Discount
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Apply a negotiated discount to the tenant&apos;s initial subscription invoice
                </p>
              </div>
            </div>
          </div>

          {!isPaidPlan ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                Free Trial tier has no invoice charge. To configure a discount, select <strong>Monthly</strong> or <strong>Yearly</strong> plan above.
              </span>
            </div>
          ) : (
            <div className="space-y-3 pt-1 border-t border-border">
              <input type="hidden" {...register("discount_type")} />
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Select Discount Mode (Choose One)
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("discount_type", DISCOUNT_TYPE.MANUAL, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      trigger(["discount_type", "discount_value"]);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      watchDiscountType === DISCOUNT_TYPE.MANUAL
                        ? "bg-background text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <IndianRupee className="h-3.5 w-3.5 text-primary" />
                    Manual Amount (₹)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setValue("discount_type", DISCOUNT_TYPE.PERCENTAGE, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      trigger(["discount_type", "discount_value"]);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      watchDiscountType === DISCOUNT_TYPE.PERCENTAGE
                        ? "bg-background text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Percent className="h-3.5 w-3.5 text-primary" />
                    Percentage (%)
                  </button>
                </div>
              </div>

              <div>
                <Input
                  label={
                    watchDiscountType === DISCOUNT_TYPE.MANUAL
                      ? `Discount Amount (₹) — Max: ₹${currentBasePrice.toLocaleString()}`
                      : "Discount Percentage (%) — Max: 100%"
                  }
                  type="number"
                  placeholder={
                    watchDiscountType === DISCOUNT_TYPE.MANUAL ? "e.g. 1000" : "e.g. 20"
                  }
                  {...register("discount_value")}
                  leftIcon={
                    watchDiscountType === DISCOUNT_TYPE.MANUAL ? (
                      <IndianRupee className="h-4 w-4" />
                    ) : (
                      <Percent className="h-4 w-4" />
                    )
                  }
                  helperText={
                    watchDiscountType === DISCOUNT_TYPE.MANUAL
                      ? `Cannot exceed selected plan price of ₹${currentBasePrice.toLocaleString()}`
                      : "Cannot exceed 100%"
                  }
                  error={errors.discount_value?.message}
                />
              </div>

              {/* Dynamic Calculation Breakdown */}
              {numericDiscountValue > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Base Plan Price:</span>
                    <span className="font-semibold text-foreground">
                      ₹{currentBasePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount Deducted:</span>
                    <span className="font-semibold">
                      -₹{discountDeduction.toLocaleString()}
                      {watchDiscountType === DISCOUNT_TYPE.PERCENTAGE ? ` (${numericDiscountValue}%)` : ""}
                    </span>
                  </div>
                  <div className="border-t border-border/60 pt-1.5 flex items-center justify-between font-bold text-foreground">
                    <span>Final Payable Invoice:</span>
                    <span className="text-primary text-sm font-extrabold">
                      ₹{netPayable.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-1">
          <Input
            label="Initial Trial Period (Days) *"
            type="number"
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
