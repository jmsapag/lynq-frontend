import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PaymentMethodDto,
  listPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "../../services/paymentsService";

export type UsePaymentMethodsReturn = {
  paymentMethods: PaymentMethodDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
};

export const usePaymentMethods = (): UsePaymentMethodsReturn => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listPaymentMethods();
      setPaymentMethods(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const remove = useCallback(
    async (id: string) => {
      await deletePaymentMethod(id);
      await fetchAll();
    },
    [fetchAll],
  );

  const setDefault = useCallback(
    async (id: string) => {
      await setDefaultPaymentMethod(id);
      await fetchAll();
    },
    [fetchAll],
  );

  return useMemo(
    () => ({
      paymentMethods,
      loading,
      error,
      refresh: fetchAll,
      remove,
      setDefault,
    }),
    [paymentMethods, loading, error, fetchAll, remove, setDefault],
  );
};
