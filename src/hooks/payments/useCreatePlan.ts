import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient.ts";

export type PlanDraft = {
  name: string;
  maxSensors: number | "";
  retentionMonths: number | "";
  priceCents: number | "";
  currency: string;
  billingInterval: string;
};

export type PlanResponse = {
  id: string;
  status: string;
};

const DRAFT_KEY = "plan-wizard-draft";

const defaultDraft: PlanDraft = {
  name: "",
  maxSensors: "",
  retentionMonths: "",
  priceCents: "",
  currency: "USD",
  billingInterval: "monthly",
};

export const useCreatePlanWizard = () => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PlanDraft>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : defaultDraft;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<PlanResponse | null>(null);

  // Client-side validation
  const validate = (data: PlanDraft) => {
    if (!data.name.trim()) return "Name is required";
    if (!data.maxSensors || data.maxSensors <= 0)
      return "Max sensors must be positive";
    if (!data.retentionMonths || data.retentionMonths <= 0)
      return "Retention must be positive";
    if (!data.priceCents || data.priceCents < 0)
      return "Price must be zero or positive";
    if (!data.currency.trim()) return "Currency is required";
    if (!data.billingInterval.trim()) return "Billing interval is required";
    return null;
  };

  // Save draft to localStorage
  const saveDraft = (data: PlanDraft) => {
    setDraft(data);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  };

  // Clear draft
  const clearDraft = () => {
    setDraft(defaultDraft);
    localStorage.removeItem(DRAFT_KEY);
  };

  // Submit plan
  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const validationError = validate(draft);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }
      const payload = {
        ...draft,
        maxSensors: Number(draft.maxSensors),
        retentionMonths: Number(draft.retentionMonths),
        priceCents: Number(draft.priceCents),
      };
      const res = await axiosPrivate.post<PlanResponse>("/plans", payload);
      setSuccess(res.data);
      clearDraft();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    draft,
    saveDraft,
    clearDraft,
    validate,
    error,
    setError,
    loading,
    submit,
    success,
  };
};
